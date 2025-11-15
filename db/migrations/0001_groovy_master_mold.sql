CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"client" varchar(255) NOT NULL,
	"order" varchar(100) NOT NULL,
	"pm" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
