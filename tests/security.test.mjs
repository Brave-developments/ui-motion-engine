import test from 'node:test';
import assert from 'node:assert/strict';
import {assertLocalUrl,isAllowedAssetUrl,validateSettings,safeChildPath} from '../server/security.mjs';
test('only local site URLs permitted, with limited ports',()=>{
 assert.equal(assertLocalUrl('http://127.0.0.1:5173/free').port,'5173');
 for(const s of ['https://example.com','http://127.0.0.1:9001','file:///etc/passwd','http://user:pass@localhost:5173'])assert.throws(()=>assertLocalUrl(s));
});
test('asset policy requires opt-in for remote HTTPS',()=>{
 assert.equal(isAllowedAssetUrl('https://images.example.com/a.png'),false);
 assert.equal(isAllowedAssetUrl('https://images.example.com/a.png',true),true);
 assert.equal(isAllowedAssetUrl('http://169.254.169.254/latest',true),false);
 assert.equal(isAllowedAssetUrl('http://localhost:5173/assets/a.svg'),true);
});
test('input settings and file paths reject unsafe inputs',()=>{
 assert.equal(validateSettings({url:'http://localhost:5173'}).fps,30);
 assert.throws(()=>validateSettings({url:'http://localhost:5173',intensity:900}));
 assert.throws(()=>safeChildPath('/tmp/project','../secrets.env'));
});
