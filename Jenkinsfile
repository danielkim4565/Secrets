pipeline {
  environment {
    dockerimagename = "danielkimtor15/my-secret-app"
    dockerImage = "danielkimtor15"
  }
  agent any
  stages {
    stage('Checkout Source') {
      steps {
        git 'https://github.com/danielkim4565/jenkins-secret-app-deployment.git'
      }
    }
    stage('Build image') {
      steps{
        script {
          dockerImage = docker.build(dockerimagename)
                              .arg("CLIENT_ID=348783514223-r347qhsjpvg1vnjcf6cotegq1rvtr4h1.apps.googleusercontent.com")
                              .arg("CLIENT_SECRET=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")
        }
      }
    }
    stage('Pushing Image') {
      environment {
               registryCredential = 'dockerhub-credentials'
           }
      steps{
        script {
          docker.withRegistry( 'https://registry.hub.docker.com', registryCredential ) {
            dockerImage.push("latest")
          }
        }
      }
    }
    stage('Deploying React.js container to Kubernetes') {
      steps {
        script {
          kubernetesDeploy(configs: "Kubernetes/mongodb-deployment.yaml", "Kubernetes/nodejs-deployment.yaml")
        }
      }
    }
  }
}