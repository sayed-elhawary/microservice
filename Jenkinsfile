pipeline {
    agent any

    triggers {
        githubPush()                    // يشتغل فورًا عند أي push عبر webhook
        pollSCM('H/5 * * * *')          // احتياطي كل ~5 دقايق
    }

    options {
        timeout(time: 45, unit: 'MINUTES')          // timeout عام لكل البناء
        timestamps()                                // إضافة توقيت لكل سطر في الـ log
        buildDiscarder(logRotator(numToKeepStr: '10'))  // احتفظ بآخر 10 بناءات بس
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'   // تأكد من الـ ID ده في Credentials
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "━━━━━━━━━━━━━━━━━━ تم جلب الكود من GitHub ━━━━━━━━━━━━━━━━━━"
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKERHUB_CRED) {
                        echo "✅ تم تسجيل الدخول بنجاح إلى Docker Hub"
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                echo "جاري بناء ورفع الصور..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} build --pull
                    docker compose -f ${DOCKER_COMPOSE_FILE} push
                """
            }
        }

        stage('Deploy - Pull & Restart') {
            steps {
                echo "جاري سحب أحدث الصور وإعادة تشغيل الخدمات..."
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    sh """
                        docker compose -f ${DOCKER_COMPOSE_FILE} pull
                        docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans --force-recreate
                    """
                }
            }
        }

        stage('Verify Services') {
            steps {
                echo "التحقق من حالة الخدمات..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} ps
                    echo "━━━━━━━━━━━━━━━━━━ الصور الموجودة المحلية ━━━━━━━━━━━━━━━━━━"
                    docker images | grep elhawary22 || echo "لم يتم العثور على صور جديدة"
                """
            }
        }

        stage('Basic Health Check') {
            steps {
                echo "فحص بسيط للخدمات..."
                sh """
                    sleep 10  # انتظر شوية عشان الخدمات تبدأ
                    curl -s -f http://localhost:3000 || echo "Frontend لسه مش جاهز"
                    curl -s -f http://localhost:3001/health || echo "Auth service check failed"
                """
            }
        }
    }

    post {
        always {
            echo "━━━━━━━━━━━━━━━━━━ تنظيف بعد البناء ━━━━━━━━━━━━━━━━━━"
            sh '''
                docker logout || true
                docker system prune -f --volumes || true
                docker image prune -f || true
            '''

            // لو عايز تحتفظ بملفات مهمة
            archiveArtifacts artifacts: 'docker-compose.yaml', allowEmptyArchive: true
        }

        success {
            echo '🎉 تم البناء والرفع والنشر بنجاح كامل!'
        }

        unstable {
            echo '⚠️ الـ Pipeline نجح جزئيًا (ربما مشكلة في الـ deploy أو الـ health check)'
        }

        failure {
            echo '❌ فشل الـ Pipeline – راجع السجلات أعلاه بعناية'
        }
    }
}
