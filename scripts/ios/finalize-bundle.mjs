import { existsSync, renameSync, rmSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.ok(existsSync('dist-ios/ios.html'), 'The iOS entry page was not built');
renameSync('dist-ios/ios.html','dist-ios/index.html');
for (const file of ['learning-stage-icons.webp','wizpiko-wordmark-email.png']) rmSync('dist-ios/'+file,{force:true});
console.log('Prepared bundled iOS entry page.');
