--
-- PostgreSQL database dump
--

-- Dumped from database version 13.16 (Debian 13.16-1.pgdg120+1)
-- Dumped by pg_dump version 14.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AllowedDomain; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AllowedDomain" (
    id text NOT NULL,
    domain text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AllowedDomain" OWNER TO postgres;

--
-- Name: Availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Availability" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL
);


ALTER TABLE public."Availability" OWNER TO postgres;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "teamOwnerId" text NOT NULL,
    "contractorId" text NOT NULL,
    "customerFirstName" text NOT NULL,
    "customerLastName" text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    description text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "endDateTime" timestamp(3) without time zone NOT NULL,
    "startDateTime" timestamp(3) without time zone NOT NULL,
    "customerEmail" text NOT NULL
);


ALTER TABLE public."Booking" OWNER TO postgres;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    start timestamp(3) without time zone NOT NULL,
    "end" timestamp(3) without time zone NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO postgres;

--
-- Name: Invitation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Invitation" (
    id text NOT NULL,
    email text NOT NULL,
    "teamOwnerId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Invitation" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "googleCalendarId" text,
    "teamOwnerId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "invitedByTeamOwner" text,
    "hasUnreadInvitation" boolean DEFAULT false NOT NULL,
    "apiKey" text,
    tier text DEFAULT 'free'::text NOT NULL,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "googleCalendarRefreshToken" text,
    "appleCalendarToken" text,
    "activeSubscription" boolean DEFAULT false NOT NULL,
    "stripeCustomerId" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UserRole" (
    id text NOT NULL,
    name text NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO postgres;

--
-- Name: _UserToUserRole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_UserToUserRole" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_UserToUserRole" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: AllowedDomain; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AllowedDomain" (id, domain, "userId", "createdAt", "updatedAt") FROM stdin;
ed43d528-7a5f-4c55-9ab9-b0b3444b0f37	http://localhost:5173	f791bdbd-3621-459a-856e-071f2cb73ac6	2024-10-07 22:09:10.985	2024-10-07 22:09:10.985
\.


--
-- Data for Name: Availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Availability" (id, "userId", "dayOfWeek", "startTime", "endTime") FROM stdin;
9fbf3202-09fd-4307-83ac-bf5baa6d9363	f791bdbd-3621-459a-856e-071f2cb73ac6	0	06:00	17:00
dae68a98-c1e6-4fe7-aa77-5d2d85def574	f791bdbd-3621-459a-856e-071f2cb73ac6	1	06:00	17:00
cefebcf9-3b25-498d-90ff-fbd356df4adf	f791bdbd-3621-459a-856e-071f2cb73ac6	2	06:00	17:00
fbc41661-79eb-4407-8827-ffb2e5ee2316	f791bdbd-3621-459a-856e-071f2cb73ac6	3	06:00	17:00
c00953e4-c16b-444b-98a9-db80eeba0abe	f791bdbd-3621-459a-856e-071f2cb73ac6	4	06:00	17:00
1d6f0533-b03e-4558-a8a9-49cc512a172e	f791bdbd-3621-459a-856e-071f2cb73ac6	5	06:00	17:00
f13329cc-0964-4ef8-acbd-71e70b4f3a50	f791bdbd-3621-459a-856e-071f2cb73ac6	6	06:00	17:00
\.


--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Booking" (id, "teamOwnerId", "contractorId", "customerFirstName", "customerLastName", address, city, state, description, "createdAt", "updatedAt", "endDateTime", "startDateTime", "customerEmail") FROM stdin;
dba6be06-b5f8-4f28-890e-20f93b43cbfd	f791bdbd-3621-459a-856e-071f2cb73ac6	f791bdbd-3621-459a-856e-071f2cb73ac6	John	Doe	123 Main St	Chicago	IL	Booking notes	2024-10-07 22:36:16.878	2024-10-07 22:36:16.878	2024-10-10 17:00:00	2024-10-10 16:00:00	john.doe@example.com
8d1289bf-062c-46b5-88ef-804b30500c79	f791bdbd-3621-459a-856e-071f2cb73ac6	f791bdbd-3621-459a-856e-071f2cb73ac6	John	Doe	123 Main St	Chicago	IL	Booking notes	2024-10-08 15:29:43.462	2024-10-08 15:29:43.462	2024-10-13 19:30:00	2024-10-13 18:30:00	devinshawntripp@gmail.com
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Event" (id, "userId", title, start, "end", description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Invitation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Invitation" (id, email, "teamOwnerId", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, "googleCalendarId", "teamOwnerId", "createdAt", "updatedAt", "invitedByTeamOwner", "hasUnreadInvitation", "apiKey", tier, "usageCount", "googleCalendarRefreshToken", "appleCalendarToken", "activeSubscription", "stripeCustomerId") FROM stdin;
f3c8e18a-9fb9-4a37-8516-0ec71bc1de8b	admin@example.com	$2a$10$KeFE9enSNsRZL3fPKbUqqeMuhGAiCEiRP06DHdHEgic.E9QIE3MMm	\N	\N	2024-10-07 21:21:04.265	2024-10-07 21:21:04.265	\N	f	\N	basic	0	\N	\N	f	\N
f791bdbd-3621-459a-856e-071f2cb73ac6	devinshawntripp@gmail.com	$2a$10$mjYC0zalVa/N6pt8ywomeujB6LjrRukopXwOiB7KkdlmDCBCwLjOe	\N	\N	2024-10-07 21:22:01.911	2024-10-08 15:29:43.477	\N	f	0231d600feed5ace31069cb7fa4ea8f48b5a9074e1afc7d1cfbe8e924a0b2987	basic	33	1//0fRLPSsLqSGgkCgYIARAAGA8SNwF-L9Ir8n8aEdvh6qEOm0-OKeQTyX22uSeoFcU4J24M33WrZd97WABGxMQfJVIy51RxwOoEu2I	\N	t	cus_QzNWIyATMC9UYh
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UserRole" (id, name) FROM stdin;
1aab02c2-c9af-4c27-a95e-f422c3b85e79	contractor
2e92fe5a-ccd3-4d95-b65f-f8d1a21cec34	team_owner
b4e14ada-0332-4e93-8e9a-2bc6fe3cdf14	admin
\.


--
-- Data for Name: _UserToUserRole; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_UserToUserRole" ("A", "B") FROM stdin;
f3c8e18a-9fb9-4a37-8516-0ec71bc1de8b	b4e14ada-0332-4e93-8e9a-2bc6fe3cdf14
f791bdbd-3621-459a-856e-071f2cb73ac6	2e92fe5a-ccd3-4d95-b65f-f8d1a21cec34
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
4de00adf-38d0-4360-ba71-1e8f732cfa79	933119b294a4edef1eada48d325dd2f4d22dd8209f201049e43224d7ae2abf85	2024-10-07 21:20:50.790935+00	20240912191241_init	\N	\N	2024-10-07 21:20:50.763832+00	1
9bc2ee91-47b5-4ef0-b196-29631c0508d0	0b945c926996d8d8133a8eeecf11bc3025f164824f70e46d83ab79b0d33eca26	2024-10-07 21:20:50.799779+00	20240913030249_add_invited_by_team_owner	\N	\N	2024-10-07 21:20:50.793354+00	1
571c3f4f-cfb1-4c4c-bf96-0f93537eab8e	7beca1d9fbe1b982937de7873e37f717ded01ffb9e83cc812d5b16dcb64e2fb7	2024-10-07 21:20:50.820188+00	20240916013024_init	\N	\N	2024-10-07 21:20:50.802089+00	1
0d23d8aa-1552-4494-b6b2-e944d6b1f3b6	4bfe64a966b462b0211d7ff14a722990cdb305f6a0ac855c290a545faab543ec	2024-10-07 21:20:50.843455+00	20240917012727_init	\N	\N	2024-10-07 21:20:50.822159+00	1
2a5bd7e6-4cf5-4244-b52c-8de43f4a7b2c	8065de56392b00fc2fe90b500444744d3c1bb0741ca3ebabb5cbbf7bf1cb7e8c	2024-10-07 21:20:50.862732+00	20240917014901_init	\N	\N	2024-10-07 21:20:50.852453+00	1
01c7c6af-3c6a-4c92-a011-567c70b688c6	422125c9b49cbd561265ca63499d8069d4e4f0fe58786ce418dc0ab7539d0fb3	2024-10-07 21:20:50.873592+00	20241005040059_dev	\N	\N	2024-10-07 21:20:50.865+00	1
94fd1b5f-9a79-41e9-9b6a-77506be69342	65ffeb7d93491d2391d4d1917287cdb092820887b48c8fc311cde9fb6d2e5bbc	2024-10-07 21:20:50.888748+00	20241006234939_add_allowed_domains	\N	\N	2024-10-07 21:20:50.875771+00	1
aca629f4-d939-42de-b927-e48a4cab225d	67e834471a9f28bfe1ec8884babb5147a0c7a50c30002a4c112b0b1107a85b00	2024-10-07 21:20:50.904065+00	20241007025235_add_availability	\N	\N	2024-10-07 21:20:50.890579+00	1
6ea0cf66-fb25-4253-95e4-87ce8d7461ad	e9238d62cca72eef0dfc9d632c23e086572634f1977fe3deac6725abd1af149b	2024-10-07 21:20:50.911821+00	20241007195842_add_google_calendar_refresh_token	\N	\N	2024-10-07 21:20:50.906194+00	1
26927a01-e468-4d62-82ed-e7cccf9312b4	a71e1273342c542d5f6a707e7948beb0aed30ba0b19ed398db654fd729a245a9	2024-10-07 21:20:51.605985+00	20241007212051_add_apple_calendar_token	\N	\N	2024-10-07 21:20:51.600257+00	1
f074738b-2d8b-4309-be84-dd1701763bc4	f7cccdeb14ea891d67b82a32c3445924c11cd5794912d9931293124f5d767cd9	2024-10-07 21:38:26.844523+00	20241007213826_add_stripe_id_and_free_tier	\N	\N	2024-10-07 21:38:26.833306+00	1
d08cf3b8-da4c-4ade-abfd-72a8a4b5e01b	c713c31e238a6d2ed0f563341dd17f55e90c8f1419f70a2ece6cb4ee1a89f02b	2024-10-08 15:24:21.670382+00	20241008152421_add_booking_email	\N	\N	2024-10-08 15:24:21.663327+00	1
ff09c304-4e8c-4114-98ae-6fff6b6352ed	5ae98012b8f936515a8c5ebacf78244700e944058b32ff4bec98051879a7f0cf	2024-12-23 03:06:28.351322+00	20241223030628_add_customer_email	\N	\N	2024-12-23 03:06:28.339857+00	1
b1067217-ee7e-474c-9c15-e62f48b18559	36a9e7f1c95b82ffb99743e0c5c4ce95d83c9a430aac59f84ef3cbfab6145068	2024-12-23 03:15:48.074558+00	20240326_add_customer_email		\N	2024-12-23 03:15:48.074558+00	0
\.


--
-- Name: AllowedDomain AllowedDomain_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AllowedDomain"
    ADD CONSTRAINT "AllowedDomain_pkey" PRIMARY KEY (id);


--
-- Name: Availability Availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Availability"
    ADD CONSTRAINT "Availability_pkey" PRIMARY KEY (id);


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Invitation Invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AllowedDomain_userId_domain_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AllowedDomain_userId_domain_key" ON public."AllowedDomain" USING btree ("userId", domain);


--
-- Name: Availability_userId_dayOfWeek_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Availability_userId_dayOfWeek_key" ON public."Availability" USING btree ("userId", "dayOfWeek");


--
-- Name: UserRole_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "UserRole_name_key" ON public."UserRole" USING btree (name);


--
-- Name: User_apiKey_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_apiKey_key" ON public."User" USING btree ("apiKey");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_stripeCustomerId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON public."User" USING btree ("stripeCustomerId");


--
-- Name: _UserToUserRole_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_UserToUserRole_AB_unique" ON public."_UserToUserRole" USING btree ("A", "B");


--
-- Name: _UserToUserRole_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_UserToUserRole_B_index" ON public."_UserToUserRole" USING btree ("B");


--
-- Name: AllowedDomain AllowedDomain_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AllowedDomain"
    ADD CONSTRAINT "AllowedDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Availability Availability_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Availability"
    ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_contractorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Booking Booking_teamOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invitation Invitation_teamOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Invitation"
    ADD CONSTRAINT "Invitation_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_teamOwnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: _UserToUserRole _UserToUserRole_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserToUserRole"
    ADD CONSTRAINT "_UserToUserRole_A_fkey" FOREIGN KEY ("A") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _UserToUserRole _UserToUserRole_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_UserToUserRole"
    ADD CONSTRAINT "_UserToUserRole_B_fkey" FOREIGN KEY ("B") REFERENCES public."UserRole"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

