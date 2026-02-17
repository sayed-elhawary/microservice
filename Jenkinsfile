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
        disableConcurrentBuilds()  // جلوگیری از تداخل اگر چند push همزمان بیاد
    }

    environment {
        DOCKER_COMPOSE_FILE = "${WORKSPACE}/docker-compose.yaml"
        DOCKERHUB_CRED      = 'docker-hub-credentials'  // حتماً مطمئن شو که این ID در Jenkins درست باشه
        IMAGE_TAG           = "${env.BUILD_NUMBER}"     // یا "${sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()}"
        DOCKERHUB_USERNAME  = 'elhawary22'              // ← اسم کاربری خودت (ثابت)
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
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        echo "━━━━━━━━━━━━━━━━━━ تم تسجيل الدخول بنجاح إلى Docker Hub ━━━━━━━━━━━━━━━━━━"
                        docker info --format '{{json .RegistryConfig.IndexConfigs.docker.io}}' | grep -i auth || echo "No auth info (normal if using token)"
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

        stage('Push Images to Docker Hub') {
            steps {
                echo "جاري رفع الصور إلى Docker Hub..."
                withCredentials([usernamePassword(
                    credentialsId: env.DOCKERHUB_CRED,
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    script {
                        // قائمة الخدمات التي تحتاج رفع (عدلها حسب docker-compose.yaml بتاعك)
                        def services = ['frontend', 'product-service', 'display-service', 'auth-service']

                        for (service in services) {
                            def fullImage = "${env.DOCKERHUB_USERNAME}/${service}:${env.IMAGE_TAG}"
                            sh """
                                docker tag ${service}:${env.IMAGE_TAG} ${fullImage}
                                echo "${DH_PASS}" | docker login -u "${DH_USER}" --password-stdin
                                docker push ${fullImage}
                                echo "تم رفع ${fullImage} بنجاح"
                            """
                        }
                    }
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
                    curl --max-time 10 -s -f http://localhost:3000/       && echo "Frontend: OK"       || echo "Frontend: FAILED"
                    curl --max-time 10 -s -f http://localhost:3001/health && echo "Auth: OK"          || echo "Auth: FAILED"
                    # أضف باقي الخدمات هنا، مثلاً:
                    # curl --max-time 10 -s -f http://localhost:3002/health || echo "Product: FAILED"
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
                docker system prune -f --filter "until=24h" || true   # بدون --volumes هنا عشان ما يمسحش volumes مهمة
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
