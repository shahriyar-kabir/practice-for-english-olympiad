-- Wizpiko Science Academy: private, server-graded learning programmes (curriculum v2).
-- Apply once to the existing Supabase project before enabling the Science UI.
-- All certificate and skill-result tables remain protected in wizpiko_learning.
insert into wizpiko_learning.programs (subject, level, version, skills, questions_per_skill, pass_mark)
select 'science', level, 2,
       array['living','matter','forces','earth','inquiry','everyday']::text[], 20, 80
from unnest(array['starter','beginner','intermediate','advanced']) as level
on conflict (subject, level, version)
do update set skills = excluded.skills,
              questions_per_skill = excluded.questions_per_skill,
              pass_mark = excluded.pass_mark;

-- Expect four Science programme rows, each with six skills and 20 questions per skill:
select subject,level,version,skills,questions_per_skill,pass_mark
from wizpiko_learning.programs where subject='science' order by level;
