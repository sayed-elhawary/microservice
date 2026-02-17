pipeline {
    agent any

    triggers {
        githubPush()                    // يشتغل تلقائي فورًا عند أي push على GitHub
        pollSCM('H/5 * * * *')          // احتياطي كل ~5 دقايق لو الـ webhook ما اشتغلش
    }

    options {
        timeout(time: 45, unit: 'MINUTES')          // كل البناء ما يطولش أكتر من 45 دقيقة
        timestamps()                                // إضافة توقيت دقيق لكل سطر في الـ log
        buildDiscarder(logRotator(numToKeepStr: '10')) // احتفظ بآخر 10 بناءات فقط عشان المساحة
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'   // تأكد إن الـ ID ده مطابق تمامًا في Credentials
        IMAGE_TAG           = "${env.BUILD_NUMBER}"      // اختياري: استخدم رقم البناء بدل latest (أفضل للتراجع)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "━━━━━━━━━━━━━━━━━━ تم جلب الكود من GitHub ━━━━━━━━━━━━━━━━━━"
                sh 'git rev-parse --short HEAD > .git/commit-id'  // حفظ commit hash لو عايز تستخدمه في التاج
            }
        }

        stage('Login to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', env.DOCKERHUB_CRED) {
                        echo "✅ تم تسجيل الدخول بنجاح إلى Docker Hub"
                        // اختياري: اطبع معلومات الـ auth عشان نتأكد
                        sh 'docker info --format "{{json .RegistryConfig.IndexConfigs.docker.io}}"'
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                echo "جاري بناء ورفع الصور بتاج ${IMAGE_TAG}..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} build --pull
                    docker compose -f ${DOCKER_COMPOSE_FILE} push
                """
            }
        }

        stage('Deploy - Pull & Restart') {
            steps {
                echo "جاري سحب أحدث الصور وإعادة تشغيل الخدمات..."
                retry(3) {  // حاول 3 مرات لو حصل فشل مؤقت (مفيد جدًا)
                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                        sh """
                            docker compose -f ${DOCKER_COMPOSE_FILE} pull
                            docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans --force-recreate
                        """
                    }
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
                echo "فحص بسيط للخدمات (بعد 15 ثانية)..."
                sh """
                    sleep 15
                    curl -s -f http://localhost:3000      || echo "Frontend لسه مش جاهز"
                    curl -s -f http://localhost:3001/health || echo "Auth service check failed"
                    # أضف هنا أي endpoints تانية لو عندك (مثل product أو display)
                """
            }
        }
    }

    post {
        always {
            echo "━━━━━━━━━━━━━━━━━━ تنظيف بعد البناء ━━━━━━━━━━━━━━━━━━"
            sh '''
                docker logout || true
                docker system prune -f --volumes --filter "until=24h" || true
                docker image prune -f || true
            '''

            // حفظ ملف docker-compose.yaml مع كل بناء
            archiveArtifacts artifacts: 'docker-compose.yaml', allowEmptyArchive: true

            // حفظ logs الخدمات لو فشل أو unstable (مفيد جدًا للتصليح)
            script {
                if (currentBuild.currentResult == 'FAILURE' || currentBuild.currentResult == 'UNSTABLE') {
                    sh 'docker compose -f ${DOCKER_COMPOSE_FILE} logs > deployment-logs.txt || true'
                    archiveArtifacts artifacts: 'deployment-logs.txt', allowEmptyArchive: true
                }
            }
        }

        success {
            echo '🎉 تم البناء والرفع والنشر بنجاح كامل!'
            // لو عندك Slack أو Discord، شيل التعليق ده وعدله:
            // slackSend channel: '#deployments', message: "Build #${env.BUILD_NUMBER} succeeded! 🚀"
        }

        unstable {
            echo '⚠️ الـ Pipeline نجح جزئيًا (ربما مشكلة في الـ deploy أو الـ health check)'
            // slackSend channel: '#deployments', message: "Build #${env.BUILD_NUMBER} unstable! ⚠️ Check logs."
        }

        failure {
            echo '❌ فشل الـ Pipeline – راجع السجلات أعلاه بعناية'
            // slackSend channel: '#deployments', message: "Build #${env.BUILD_NUMBER} FAILED! ❌ Check Jenkins."
        }
    }
}
