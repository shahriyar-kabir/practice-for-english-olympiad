-- Verified certificate snapshots and expanded learner avatar choices.
-- Existing issued certificates deliberately retain NULL score snapshots and their UUIDs.
BEGIN;
ALTER TABLE wizpiko_learning.certificates
  ADD COLUMN IF NOT EXISTS display_id text,
  ADD COLUMN IF NOT EXISTS correct_count integer,
  ADD COLUMN IF NOT EXISTS achievement_percentage numeric(5,2);
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='wizpiko_learning.certificates'::regclass AND conname='certificates_display_id_key') THEN
    ALTER TABLE wizpiko_learning.certificates ADD CONSTRAINT certificates_display_id_key UNIQUE(display_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='wizpiko_learning.certificates'::regclass AND conname='certificates_verified_snapshot_check') THEN
    ALTER TABLE wizpiko_learning.certificates ADD CONSTRAINT certificates_verified_snapshot_check CHECK (
      (correct_count IS NULL AND achievement_percentage IS NULL)
      OR (correct_count IS NOT NULL AND achievement_percentage IS NOT NULL
          AND correct_count BETWEEN 0 AND question_count
          AND achievement_percentage BETWEEN pass_mark AND 100
          AND achievement_percentage=round(100.0*correct_count/question_count,2))
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.wizpiko_learning_claim_certificate(
  p_user uuid,p_subject text,p_level text,p_version integer,p_full_name text
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  programme wizpiko_learning.programs%rowtype;
  result wizpiko_learning.certificates%rowtype;
  certificate_name text;
  passed integer;
  correct integer;
  question_total integer;
  subject_code text;
  stage_code text;
  candidate text;
  issue_time timestamptz := now();
  attempt integer;
  violated_constraint text;
BEGIN
  certificate_name=trim(regexp_replace(p_full_name,'[[:space:]]+',' ','g'));
  IF p_user IS NULL OR certificate_name IS NULL OR char_length(certificate_name) NOT BETWEEN 1 AND 100 OR p_full_name ~ '[[:cntrl:]<>]' THEN
    RAISE EXCEPTION 'full_name_required' USING errcode='22023';
  END IF;
  -- An existing certificate is immutable, even after the student's best score improves.
  SELECT * INTO result FROM wizpiko_learning.certificates
    WHERE user_id=p_user AND subject=p_subject AND level=p_level AND version=p_version;
  IF FOUND THEN RETURN to_jsonb(result)-'user_id'; END IF;
  SELECT * INTO programme FROM wizpiko_learning.programs
    WHERE subject=p_subject AND level=p_level AND version=p_version;
  IF NOT FOUND THEN RAISE EXCEPTION 'programme_not_found' USING errcode='22023'; END IF;
  -- One statement uses one consistent snapshot and only required, verified skills.
  SELECT count(*)::integer,coalesce(sum(best_correct),0)::integer,coalesce(sum(question_count),0)::integer
    INTO passed,correct,question_total
    FROM wizpiko_learning.skill_results
    WHERE user_id=p_user AND subject=p_subject AND level=p_level AND version=p_version
      AND skill=ANY(programme.skills) AND question_count=programme.questions_per_skill
      AND best_correct*100>=programme.pass_mark*question_count;
  IF passed<>cardinality(programme.skills) OR question_total<>cardinality(programme.skills)*programme.questions_per_skill THEN
    RAISE EXCEPTION 'level_not_qualified' USING errcode='22023';
  END IF;
  subject_code=CASE p_subject WHEN 'maths' THEN 'MAT' WHEN 'english' THEN 'ENG'
    ELSE upper(left(regexp_replace(p_subject,'[^a-zA-Z0-9]','','g'),3)) END;
  stage_code=CASE p_level WHEN 'starter' THEN 'STA' WHEN 'beginner' THEN 'BEG'
    WHEN 'intermediate' THEN 'INT' WHEN 'advanced' THEN 'ADV'
    ELSE upper(left(regexp_replace(p_level,'[^a-zA-Z0-9]','','g'),3)) END;
  FOR attempt IN 1..10 LOOP
    candidate='WZ-'||subject_code||'-'||stage_code||'-'||to_char(issue_time AT TIME ZONE 'Asia/Dhaka','YYYY')||'-'||upper(left(replace(gen_random_uuid()::text,'-',''),8));
    BEGIN
      INSERT INTO wizpiko_learning.certificates(user_id,subject,level,version,full_name,issued_at,skill_count,question_count,pass_mark,display_id,correct_count,achievement_percentage)
      VALUES(p_user,p_subject,p_level,p_version,certificate_name,issue_time,cardinality(programme.skills),question_total,programme.pass_mark,candidate,correct,round(100.0*correct/question_total,2))
      ON CONFLICT(user_id,subject,level,version) DO NOTHING RETURNING * INTO result;
      IF NOT FOUND THEN
        SELECT * INTO result FROM wizpiko_learning.certificates WHERE user_id=p_user AND subject=p_subject AND level=p_level AND version=p_version;
      END IF;
      IF result.id IS NOT NULL THEN RETURN to_jsonb(result)-'user_id'; END IF;
    EXCEPTION WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS violated_constraint=CONSTRAINT_NAME;
      IF violated_constraint<>'certificates_display_id_key' THEN RAISE; END IF;
    END;
  END LOOP;
  RAISE EXCEPTION 'certificate_id_generation_failed';
END;
$$;
REVOKE ALL ON FUNCTION public.wizpiko_learning_claim_certificate(uuid,text,text,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.wizpiko_learning_claim_certificate(uuid,text,text,integer,text) TO service_role;

-- No user identifiers/email/DOB are exposed. Sharing tokens remain separate from display IDs.
CREATE OR REPLACE FUNCTION public.wizpiko_learning_public_certificate(p_token uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT jsonb_build_object('id',id,'subject',subject,'level',level,'version',version,'full_name',full_name,'issued_at',issued_at,
   'skill_count',skill_count,'question_count',question_count,'pass_mark',pass_mark,'public_token',public_token,
   'display_id',display_id,'correct_count',correct_count,'achievement_percentage',achievement_percentage)
 FROM wizpiko_learning.certificates WHERE public_token=p_token AND public_token IS NOT NULL LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.wizpiko_learning_public_certificate(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.wizpiko_learning_public_certificate(uuid) TO service_role;

-- Preserve the issued name, ID, stage and result while allowing opt-in sharing changes.
CREATE OR REPLACE FUNCTION wizpiko_learning.preserve_issued_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF ROW(NEW.id,NEW.user_id,NEW.subject,NEW.level,NEW.version,NEW.full_name,NEW.issued_at,NEW.skill_count,NEW.question_count,NEW.pass_mark,NEW.display_id,NEW.correct_count,NEW.achievement_percentage)
   IS DISTINCT FROM ROW(OLD.id,OLD.user_id,OLD.subject,OLD.level,OLD.version,OLD.full_name,OLD.issued_at,OLD.skill_count,OLD.question_count,OLD.pass_mark,OLD.display_id,OLD.correct_count,OLD.achievement_percentage) THEN
   RAISE EXCEPTION 'issued_certificate_is_immutable' USING errcode='22023';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION wizpiko_learning.preserve_issued_certificate() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS preserve_issued_certificate ON wizpiko_learning.certificates;
CREATE TRIGGER preserve_issued_certificate BEFORE UPDATE ON wizpiko_learning.certificates FOR EACH ROW EXECUTE FUNCTION wizpiko_learning.preserve_issued_certificate();

-- Profile avatar choices only. Signup trigger and registration readiness remain untouched.
-- The production constraint name is learner_profiles_avatar_check.
ALTER TABLE public.learner_profiles DROP CONSTRAINT IF EXISTS learner_profiles_avatar_check;
ALTER TABLE public.learner_profiles ADD CONSTRAINT learner_profiles_avatar_check CHECK (avatar IN ('girl','boy','robot','panda','cat','teen-girl','teen-boy','young-woman','young-man','woman','man','middle-woman','middle-man'));
COMMIT;
