pipeline {
    agent any

    triggers {
        githubPush()                    // يشتغل فوراً عند push عبر webhook
        pollSCM('H/5 * * * *')          // احتياطي كل ~5 دقائق
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'   // تأكد من الـ ID في Credentials
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to Docker Hub') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
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
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} build
                    docker compose -f ${DOCKER_COMPOSE_FILE} push
                """
            }
        }

        stage('Deploy - Pull & Restart') {
            steps {
                echo "جاري سحب أحدث الصور وإعادة تشغيل الخدمات..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} pull
                    docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans --force-recreate
                """
            }
        }

        stage('Verify Services') {
            steps {
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} ps
                    echo "الصور الحديثة:"
                    docker images | grep elhawary22 || echo "لم يتم العثور على صور"
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            sh 'docker system prune -f --volumes || true'
        }
        success {
            echo '🎉 تم البناء والرفع والنشر بنجاح!'
        }
        failure {
            echo '❌ فشل الـ Pipeline – راجع السجلات أعلاه'
        }
    }
}
