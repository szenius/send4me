SET SQL_SAFE_UPDATES = 0;

DELETE FROM chats;
DELETE FROM messages;
DELETE FROM options;
DELETE FROM responses;
DELETE FROM users;

INSERT INTO chats VALUES('-1001205975376', 'Test Chat');

INSERT INTO messages VALUES(1,'Hello this is a test message','2020-01-12 00:00:00','2030-01-12 00:00:00',true,false,false,'-1001205975376');

INSERT INTO options VALUES(1,'coming',1,'-1001205975376');
INSERT INTO options VALUES(1,'not coming',2,'-1001205975376');

INSERT INTO users VALUES('TEST_USER_1', 'testuser1', 'Test', 'User');
INSERT INTO users VALUES('TEST_USER_2', NULL, 'Test2', 'User2');
INSERT INTO users VALUES('TEST_USER_3', 'testuser3', 'Test3', 'User3');

INSERT INTO responses VALUES('TEST_USER_1', 1);
INSERT INTO responses VALUES('TEST_USER_2', 1);
INSERT INTO responses VALUES('TEST_USER_3', 2);