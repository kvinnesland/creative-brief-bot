-- CR-001: Rollback — drops all tables and types created in 001_initial_schema.sql
-- WARNING: destructive. Only run on a database with no production data.

drop table if exists attachments           cascade;
drop table if exists conversation_messages cascade;
drop table if exists brief_states          cascade;
drop table if exists brief_sessions        cascade;

drop type if exists attachment_type cascade;
drop type if exists message_role    cascade;
drop type if exists session_status  cascade;

drop function if exists update_updated_at cascade;
