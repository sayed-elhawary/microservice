pipeline {
    agent any

    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED = 'docker-hub-credentials'   // ← غيّر لو الـ ID مختلف
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'selhawary2025@gmail.com',
                    passwordVariable: 'hH01230123'
                )]) {
                    sh 'echo $DH_PASS | docker login -u $DH_USER --password-stdin'
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
                echo "Pulling latest images and redeploying..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} pull
                    docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans --force-recreate
                """
            }
        }

        stage('Verify') {
            steps {
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} ps"
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Build, Push & Deploy Done!'
        }
        failure {
            echo '❌ Failed somewhere'
        }
    }
}
