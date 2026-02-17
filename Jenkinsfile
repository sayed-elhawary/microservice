pipeline {
    agent any

    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'
        IMAGE_TAG           = "${env.BUILD_NUMBER}"
        DOCKERHUB_USERNAME  = 'elhawary22'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "━━━━━━━━━━━━━━━━━━ تم جلب الكود من GitHub ━━━━━━━━━━━━━━━━━━"
                sh 'git rev-parse --short HEAD > .git/commit-id'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin https://index.docker.io/v1/
                        echo "━━━━━━━━━━━━━━━━━━ تم تسجيل الدخول بنجاح إلى Docker Hub ━━━━━━━━━━━━━━━━━━"
                        docker info --format '{{json .RegistryConfig.IndexConfigs.docker.io}}' | grep -i auth || echo "تم اللوجن بدون مشاكل"
                    '''
                }
            }
        }

        stage('Build Images') {
            steps {
                echo "جاري بناء الصور بتاج ${IMAGE_TAG}..."
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} build --pull --no-cache
                """
            }
        }

        // ── Optional: uncomment to see actual local image names after build ──
        // stage('Debug: List Built Images') {
        //     steps {
        //         sh 'docker images --format "table {{.Repository}}:{{.Tag}}\\t{{.ID}}" | grep -E "${DOCKERHUB_USERNAME}|${IMAGE_TAG}" || echo "No matching images found"'
        //     }
        // }

        stage('Push Images to Docker Hub') {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                echo "جاري رفع الصور إلى Docker Hub بتاج ${IMAGE_TAG}..."
                withCredentials([usernamePassword(
                    credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin https://index.docker.io/v1/
                        docker compose -f "${DOCKER_COMPOSE_FILE}" push
                        echo "━━━━━━━━━━━━━━━━━━ تم رفع جميع الصور بنجاح ━━━━━━━━━━━━━━━━━━"
                    '''
                }
            }
        }

        stage('Deploy - Pull & Restart') {
            when { expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' } }
            steps {
                echo "جاري سحب الصور الجديدة وإعادة تشغيل الخدمات..."
                retry(3) {
                    catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                        sh """
                            docker compose -f ${DOCKER_COMPOSE_FILE} pull
                            docker compose -f ${DOCKER_COMPOSE_FILE} up -d --remove-orphans --force-recreate --no-deps
                        """
                    }
                }
            }
        }

        stage('Verify Services') {
            steps {
                sh """
                    docker compose -f ${DOCKER_COMPOSE_FILE} ps --format "table {{.Name}}\\t{{.State}}\\t{{.Status}}"
                    echo "━━━━━━━━━━━━━━━━━━ الصور المحلية ━━━━━━━━━━━━━━━━━━"
                    docker images | grep "${DOCKERHUB_USERNAME}" || echo "ما فيش صور جديدة"
                """
            }
        }

        stage('Basic Health Check') {
            steps {
                echo "فحص صحة الخدمات (بعد 20 ثانية)..."
                sh '''
                    sleep 20
                    set +e
                    curl --max-time 10 -s -f http://localhost:3000/       && echo "Frontend: OK" || echo "Frontend: FAILED"
                    curl --max-time 10 -s -f http://localhost:3001/health && echo "Auth: OK"     || echo "Auth: FAILED"
                    # curl --max-time 10 -s -f http://localhost:3002/...    && echo "Product: OK" || echo "Product: FAILED"
                    set -e
                '''
            }
        }
    }

    post {
        always {
            echo "━━━━━━━━━━━━━━━━━━ تنظيف بعد البناء ━━━━━━━━━━━━━━━━━━"
            sh '''
                docker logout || true
                docker image prune -f || true
                docker system prune -f --filter "until=24h" || true
            '''
            archiveArtifacts artifacts: 'docker-compose.yaml, deployment-logs.txt', allowEmptyArchive: true

            script {
                if (currentBuild.currentResult in ['FAILURE', 'UNSTABLE']) {
                    sh 'docker compose -f ${DOCKER_COMPOSE_FILE} logs --no-color > deployment-logs.txt || true'
                    archiveArtifacts artifacts: 'deployment-logs.txt', allowEmptyArchive: true
                }
            }
        }
        success  { echo '🎉 تم البناء والرفع والنشر بنجاح كامل!' }
        unstable { echo '⚠️ Pipeline نجح جزئياً – راجع الـ logs' }
        failure  { echo '❌ فشل الـ Pipeline – شوف السجلات بعناية' }
    }
}
