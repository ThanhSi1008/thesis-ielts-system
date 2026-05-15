# Stage 7 — Common Task Playbooks

> Step-by-step recipes for the most frequent modifications. Follow these exactly.

---

## Task 1: Add a New API Endpoint

### Steps

1. **Find the right module** in `backend-core/src/modules/`
2. **Define DTO** in `dto/{module}.dto.ts`:
   ```typescript
   import { IsString, IsOptional } from 'class-validator';
   export class CreateThingDto {
     @IsString() name: string;
     @IsOptional() @IsString() description?: string;
   }
   ```
3. **Add service method** in `{module}.service.ts`:
   ```typescript
   async createThing(userId: string, dto: CreateThingDto) {
     return this.prisma.thing.create({ data: { ...dto, userId } });
   }
   ```
4. **Add controller route** in `{module}.controller.ts`:
   ```typescript
   @Post('things')
   @UseGuards(JwtAuthGuard)
   async createThing(@Request() req: any, @Body() dto: CreateThingDto) {
     return this.service.createThing(req.user.id, dto);
   }
   ```
5. **Test**: `curl -X POST http://localhost:3000/api/v1/{module}/things -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"name":"test"}'`

---

## Task 2: Add a New Database Model

### Steps

1. **Edit** `backend-core/prisma/schema.prisma`:
   ```prisma
   model NewThing {
     id        String   @id @default(uuid())
     userId    String
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     @@map("new_things")
   }
   ```
2. **Add relation** to `User` model: `newThings NewThing[]`
3. **Run migration**:
   ```bash
   cd backend-core
   npx prisma migrate dev --name add-new-thing
   npx prisma generate
   ```
4. **(Optional) Add seed data** in `prisma/data/` and reference from `prisma/seed.ts`

---

## Task 3: Add a New Frontend Page

### Steps

1. **Create route file**: `frontend-web/src/app/{path}/page.tsx`
2. **Use client component** if interactive:
   ```tsx
   'use client';
   import { useState, useEffect } from 'react';
   import { someApi } from '@/services/some.api';
   
   export default function NewPage() {
     const [data, setData] = useState(null);
     useEffect(() => { someApi.getData().then(setData); }, []);
     return <div>...</div>;
   }
   ```
3. **Add API service** if needed in `src/services/`:
   ```typescript
   import api from '@/config/api';
   export const newApi = {
     getData: async () => { const { data } = await api.get('/new-endpoint'); return data; },
   };
   ```
4. **Add types** in `src/types/index.ts`
5. **Add navigation link** in `Header.tsx` if it's a top-level page

---

## Task 4: Add a New Frontend Component

### Steps

1. **Decide location**:
   - Shared across pages → `src/components/`
   - Page-specific → `src/app/{page}/components/` or `src/app/{page}/_components/`
2. **Follow SRP**: Component ≤ 120 lines, renders UI only
3. **Extract logic** into a custom hook if the component needs data fetching
4. **Props interface**: Only pass what the component needs (ISP — no giant objects)
5. **Use Tailwind tokens**: No hardcoded hex or pixel values

---

## Task 5: Modify an Existing Module

### Steps

1. **Read the existing code first**: controller, service, and frontend page
2. **Check the Prisma schema** for the relevant models
3. **Follow existing patterns** — don't invent new conventions
4. **If adding a field to an existing model**:
   - Edit `schema.prisma`
   - Run `npx prisma migrate dev --name describe-change`
   - Run `npx prisma generate`
   - Update service to use the new field
   - Update frontend type in `src/types/index.ts`
   - Update API service if response shape changed
   - Update component to display/use the new field

---

## Task 6: Add AI-Graded Feature

### Steps

1. **Backend Core** — Create endpoint that:
   - Saves user submission to DB (with status=PENDING)
   - Publishes message to RabbitMQ via `AiClientService`
   
2. **Backend AI** — Create or modify consumer:
   - Listen on the correct queue
   - Process with Gemini/Whisper
   - Write results directly to DB via psycopg2
   - ACK the message

3. **Frontend** — Implement polling or optimistic UI:
   ```typescript
   // Poll for completion
   const pollResult = async (sessionId: string) => {
     const interval = setInterval(async () => {
       const result = await api.getSession(sessionId);
       if (result.status === 'COMPLETED') {
         clearInterval(interval);
         setResult(result);
       }
     }, 2000);
   };
   ```

---

## Task 7: Seed New Data

### Steps

1. **Create data file**: `backend-core/prisma/data/new-data.ts`
   ```typescript
   export const newData = [
     { name: 'Item 1', ... },
     { name: 'Item 2', ... },
   ];
   ```
2. **Import in seed.ts**: `backend-core/prisma/seed.ts`
   ```typescript
   import { newData } from './data/new-data';
   // In the main seed function:
   for (const item of newData) {
     await prisma.newThing.upsert({
       where: { id: item.id },  // or unique field
       update: item,
       create: item,
     });
   }
   ```
3. **Run**: `cd backend-core && npm run prisma:seed`

---

## Task 8: Debug a Production Issue

### Checklist

1. **Check backend logs**: Terminal running `npm run start:dev`
2. **Check browser console**: Network tab for failed API calls
3. **Check DB directly**: Use PgAdmin at `localhost:5050` or Prisma Studio:
   ```bash
   cd backend-core && npx prisma studio
   ```
4. **Check RabbitMQ**: UI at `localhost:15672` — look for unacknowledged messages
5. **Check MinIO**: Console at `localhost:9001` — verify file uploads exist

---

## Important Conventions to Remember

| When You... | Do This |
|-------------|---------|
| Need a new color | Add to `tailwind.config.js`, don't hardcode hex |
| Need global state | Use `zustand`, not Context API |
| Need to validate a form | Use `react-hook-form` + `zod` |
| Need to show feedback | Use `toast()` from `@/components/Toaster` |
| Need a confirmation | Use `ConfirmModal` from `@/components/ConfirmModal` |
| Need to format a date | Use `toLocaleDateString()` with options, not a library |
| Need to call an API | Add to `src/services/`, never call from component directly |
| Need auth in a request | The API axios instance handles it automatically |
| Need file upload | Use `StorageService` (backend) / `vocabLabApi.uploadMedia()` (frontend) |
