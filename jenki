pipeline {
    agent any

    // ────────────────────────────────────────────────
    // Triggers: webhook + polling كل 5 دقايق كاحتياطي
    // ────────────────────────────────────────────────
    triggers {
        // GitHub webhook (لازم تفعّل الـ GitHub hook في إعدادات الـ job)
        githubPush()
        
        // polling كاحتياطي لو الـ webhook ما وصلش
        pollSCM('H/5 * * * *')   // كل 5 دقايق (H = hash لتوزيع الحمل)
    }

    environment {
        // المسارات اللي هنستخدمها
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        
        // لو عندك أكتر من compose file ممكن تضيف
        // COMPOSE_PROJECT_NAME = "microservice"
    }

    options {
        // متعملش build لو فيه بناء شغال حاليًا على نفس الـ branch
        disableConcurrentBuilds()
        
        // احتفظ بآخر 10 بناءات بس عشان المساحة
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // timeout لو البناء طول أوي
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "━━━━━━━━━━━━━━━━━━ Cloning Repository ━━━━━━━━━━━━━━━━━━"
                checkout scm   // ← ده الأفضل لما تستخدم Pipeline from SCM
                // لو عايز تكتبه يدوي (مش مستحسن هنا):
                // git branch: 'main', url: 'https://github.com/sayed-elhawary/microservice.git'
            }
        }

        stage('Verify docker-compose file') {
            steps {
                sh "ls -la ${DOCKER_COMPOSE_FILE} || echo 'docker-compose.yaml not found!'"
                sh "cat ${DOCKER_COMPOSE_FILE} | head -n 15"   // عشان نشوف أول جزء
            }
        }

        stage('Stop previous containers') {
            steps {
                echo "Stopping any old containers..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                """
            }
        }

        stage('Build & Start Services') {
            steps {
                echo "Building and starting services..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                    docker compose -f ${DOCKER_COMPOSE_FILE} up -d --force-recreate --remove-orphans
                """
            }
        }

        stage('Check running services') {
            steps {
                echo "Checking container status..."
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} ps"
            }
        }
    }

    post {
        always {
            echo "━━━━━━━━━━━━━━━━━━ Pipeline finished ━━━━━━━━━━━━━━━━━━"
            // لو عايز logs أو تنظيف
            sh 'docker system prune -f || true'
        }

        success {
            echo '🎉 Deployment Successful!'
            // ممكن تضيف إشعار (email/slack/discord) هنا لاحقًا
        }

        failure {
            echo '❌ Something went wrong!'
            // ممكن ترسل إشعار بالفشل
        }

        unstable {
            echo '⚠️ Pipeline is unstable'
        }
    }
}
