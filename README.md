# MAYAK.MAT — Telegram Mini App для репетитора

React + TypeScript + Vite + Supabase (PostgreSQL, RLS, Edge Functions). Работает в Telegram и в обычном браузере.

## Запуск
1. `npm install`
2. Создай проект в Supabase. В SQL Editor выполни `supabase/migrations/001_init.sql`.
3. Authentication → Providers → Email: выключи «Allow new users to sign up» (пользователей создаёт только Edge Function).
4. Скопируй `.env.example` в `.env` и вставь `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
5. Edge Function (Supabase CLI):
   ```
   supabase link --project-ref <ref>
   supabase secrets set BOT_TOKEN=<токен бота> TEACHER_TG_ID=<твой Telegram ID> AUTH_SALT=<любая длинная случайная строка>
   supabase functions deploy telegram-auth
   ```
6. `npm run dev` (локально) или `npm run build` и выложи папку `dist` на любой HTTPS-хостинг (Vercel, Netlify, Cloudflare Pages).
7. Telegram: @BotFather → твой бот → Bot Settings → Menu Button (или /newapp) → URL задеплоенного приложения.

## Роли и вход
- Ты (TEACHER_TG_ID) получаешь роль преподавателя при первом входе из Telegram; папки 5–11 классов создаются автоматически.
- Ученика добавляешь в разделе «Ученики», указав его Telegram ID. Когда он откроет Mini App, аккаунт привяжется сам.
- Вход в браузере (для отладки): создай пользователя в Supabase → Authentication → Users, затем
  `update profiles set role='teacher' where id='<uuid пользователя>';`

## Безопасность
- initData проверяется на сервере (HMAC по токену бота), секреты только в Edge Function.
- RLS включён на всех таблицах; роль хранится в БД, клиентским данным не доверяем.
- Ученик видит только свои занятия (через view `my_lessons` без цены и оплаты), свои задания и результаты.
- При выдаче задания `assign_task` делает неизменяемый снимок (`assignments.snapshot`); результаты ссылаются на выданную версию.

## Что работает (по коду)
Вход через Telegram, главная, ученики (поиск, профиль, история), расписание (создание, перенос, отмена со статусом, отметки для ученика), финансы (оплата, доход за месяц), библиотека (вложенные папки, поиск, сортировка), редактор заданий (4 типа вопросов, порядок, предпросмотр), выдача, прохождение с проверкой, результаты, статистика, светлая/тёмная тема.

## Ограничения этой версии
- **Сборка и запуск не проверялись**: в среде, где писался код, не было доступа к npm. Выполни `npm install && npm run build`; `npm run typecheck` покажет возможные ошибки типов.
- Не сделаны: перемещение и копирование папок/заданий, переименование заданий отдельно от редактора, редактирование и удаление занятий кроме отмены.
- Баллы считаются на клиенте (правильные ответы лежат в снимке задания). Для контрольных работ потребуется серверная проверка.
- Telegram SDK подключён официальным скриптом `telegram-web-app.js`, а не npm-пакетом.
