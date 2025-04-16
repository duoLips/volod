CREATE TABLE "OTP" (
  "id" integer PRIMARY KEY,
  "code" integer,
  "email" varchar,
  "created_at" timestamp,
  "expires_at" timestamp,
  "attempts" integer DEFAULT 0,
  "status" bool DEFAULT false
);

CREATE TABLE "roles" (
  "id" integer PRIMARY KEY,
  "role_name" varchar
);

CREATE TABLE "media" (
  "id" integer PRIMARY KEY,
  "entity_id" integer,
  "entity_type" varchar,
  "img_path" varchar
);

CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "first_name" varchar,
  "last_name" varchar,
  "username" varchar DEFAULT null,
  "passhash" varchar,
  "email" varchar,
  "phone" integer DEFAULT null,
  "role_id" integer NOT NULL,
  "created_at" timestamp,
  "address" varchar DEFAULT null
);

CREATE TABLE "news" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "body" text,
  "user_id" integer,
  "created_at" timestamp,
  "edited_at" timestamp
);

CREATE TABLE "reports" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "body" text,
  "user_id" integer,
  "auction_id" integer,
  "created_at" timestamp,
  "edited_at" timestamp
);

CREATE TABLE "auctions" (
  "id" integer PRIMARY KEY,
  "title" varchar,
  "body" text,
  "user_id" integer,
  "banka_link" varchar,
  "prize" varchar,
  "winner_id" integer DEFAULT null,
  "status" bool,
  "created_at" timestamp,
  "ends_at" date,
  "edited_at" timestamp
);

CREATE TABLE "comms" (
  "id" integer PRIMARY KEY,
  "entity_id" integer DEFAULT null,
  "entity_type" varchar,
  "user_id" integer,
  "body" text,
  "parent_id" integer,
  "created_at" timestamp
);

COMMENT ON COLUMN "news"."body" IS 'Content of the post';

COMMENT ON COLUMN "comms"."parent_id" IS 'parent_id != id in app';

ALTER TABLE "users" ADD CONSTRAINT "users_roles" FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "news" ADD CONSTRAINT "news_author" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "auctions" ADD CONSTRAINT "auctions_author" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "auctions" ADD CONSTRAINT "auctions_winner" FOREIGN KEY ("winner_id") REFERENCES "users" ("id");

ALTER TABLE "reports" ADD CONSTRAINT "reports_author" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "media" ADD CONSTRAINT "images_news" FOREIGN KEY ("entity_id") REFERENCES "news" ("id");

ALTER TABLE "media" ADD CONSTRAINT "images_auctions" FOREIGN KEY ("entity_id") REFERENCES "auctions" ("id");

ALTER TABLE "media" ADD CONSTRAINT "images_reports" FOREIGN KEY ("entity_id") REFERENCES "reports" ("id");

ALTER TABLE "comms" ADD CONSTRAINT "comm_author" FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "comms" ADD CONSTRAINT "comm_news" FOREIGN KEY ("entity_id") REFERENCES "news" ("id");

ALTER TABLE "comms" ADD CONSTRAINT "comm_auctions" FOREIGN KEY ("entity_id") REFERENCES "auctions" ("id");

ALTER TABLE "comms" ADD CONSTRAINT "comm_reports" FOREIGN KEY ("entity_id") REFERENCES "reports" ("id");

ALTER TABLE "comms" ADD CONSTRAINT "comm_parent" FOREIGN KEY ("parent_id") REFERENCES "comms" ("id");
