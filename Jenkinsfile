pipeline {
    agent any

    stages {
        stage('Build & Test') {
            steps {
                dir('interview-service') {
                    sh './mvnw -B clean verify'
                }
            }
        }
        stage('Docker image') {
            steps {
                dir('interview-service') {
                    sh 'docker build -t tudummmm/interview-service:${BUILD_NUMBER} .'
                }
            }
        }
    }

    post {
        always {
            junit testResults: 'interview-service/target/surefire-reports/*.xml', allowEmptyResults: true
        }
    }
}