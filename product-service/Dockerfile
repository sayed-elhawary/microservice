# المرحلة الأولى: بناء التطبيق (builder stage)
FROM node:18-alpine AS builder

# تحديد مجلد العمل داخل الحاوية
WORKDIR /app

# نسخ ملفات الـ dependencies أولاً للاستفادة من الـ cache
COPY package*.json ./

# تثبيت الـ dependencies
RUN npm install

# نسخ باقي ملفات المشروع
COPY . .

# المرحلة الثانية: صورة الإنتاج (أخف وزنًا)
FROM node:18-alpine

# تحديد مجلد العمل
WORKDIR /app

# نسخ الملفات المهمة فقط من مرحلة البناء
COPY --from=builder /app /app

# التأكد من أن مجلد uploads موجود (حتى لو كان فارغًا)
RUN mkdir -p /app/uploads

# فتح المنفذ الذي يعمل عليه الـ service
EXPOSE 3002

# الأمر الذي يتم تشغيله عند بدء الحاوية
CMD ["npm", "start"]
