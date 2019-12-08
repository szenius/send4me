SET SQL_SAFE_UPDATES = 0;

DELETE FROM chats;
DELETE FROM messages;
DELETE FROM options;
DELETE FROM responses;
DELETE FROM users;

INSERT INTO chats VALUES('-1001205975376', 'Test Chat');

INSERT INTO messages VALUES(1,'Hello this is a test message','2019-12-08 06:46:00','2019-12-08 06:50:00',true,false,false,'-1001205975376');

INSERT INTO options VALUES(1,'coming',1,'-1001205975376');
INSERT INTO options VALUES(1,'not coming',2,'-1001205975376');