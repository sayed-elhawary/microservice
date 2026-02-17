pipeline {
    agent any

    triggers {
        githubPush()                    // webhook من GitHub
        pollSCM('H/5 * * * *')          // احتياطي كل ~5 دقايق
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'   // غيّر لو الـ ID مختلف
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
                        echo "✅ Successfully authenticated with Docker Hub (credential: ${env.DOCKERHUB_CRED})"
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
                echo "Pulling latest images and restarting services..."
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
                    echo "Recent images:"
                    docker images | grep elhawary22 || echo "No images found"
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
            echo '🎉 Build, Push & Deploy completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed – check the logs above'
        }
        unstable {
            echo '⚠️ Pipeline unstable'
        }
    }
}
