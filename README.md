### Project Description:
This project uses the BrokenCrystals application, which is a benchmark application that simulates a vulnerable environment. The Brokencrystals application (https://github.com/NeuraLegion/brokencrystals) has been forked and cloned as is in this repository, and necessary modifications made for the purpose of this project.


### Project Objective: 
The object of this project is to implement a secure CI/CD pipeline using Jenkins and/or GitHub Actions to automate the build, test, and deployment processes, incorporating security best practices throughout the development lifecycle.

### Project Key Requirements:

**Static Code Analysis:** Integrate a Static Application Security Testing (SAST) tool (such as SonarQube or Snyk) into the pipeline to analyze code for vulnerabilities.

**Secrets Management:** Utilize a secrets management tool (like HashiCorp Vault or AWS Secrets Manager) to securely manage sensitive information and credentials.

**Docker Image:** Build and push the Docker image to any selected Docker registry (such as Amazon ECR or Docker Hub) following security best practices. Configure image scanning for the deployed Docker images to detect vulnerabilities.

**Deployment:** Deploy the application to a Kubernetes cluster provisioned with Minikube or Kind. Use port forwarding to ensure that the application is publicly accessible.

**Dynamic Application Security Testing (DAST):** Implement DAST tools (such as OWASP ZAP) into the pipeline to test for vulnerabilities after deployment.

## Deliverables:

GitHub Repository containing a Dockerfile, Jenkins pipeline script or GitHub Actions workflow file, Kubernetes manifests (YAML files) for deployment, Configuration files for security tools, and README file documenting the project setup and execution.

Screenshots showing pipeline execution, the deployed application, and security scan results.

### Project Implementation

This repository uses:
* SonarQube and Jenkins for Static Application Security Testing
* Dockerhub for container registry
* kubectl and eksctl utilities to deploy images to AWS EKS
* AWS Secrets to manage sensitive information, being DATABASE_USERNAME and DATABASE_PASSWORD
* OWASP ZAP for Dynamic Application Security Testing
* k8s directory for kubernetes manifest files, namely cluster.yml, app.yaml, and brokencrystals-secret-provider.yml



## Create a Jenkins Pipeline for SonarQube Static Application Security Testing

**1.** Launch an Amazon Linux t2.large ec2 instance and assign ssm role

**2.** Connect to the terminal of the ec2 instance via Session Manager on the AWS Console

**3a.** Move to root user
```
sudo su
```
**3b.** Make sure you are in the usr directory, hence run ```cd ..``` if you are in bin directory

**4.** Download install.sh file to install docker
```
wget -O install.sh https://raw.GitHubusercontent.com/seyramgabriel/brokencrystals/refs/heads/stable/jenkins_SonarQube/install.sh
```

**5.** Add executable permission for install.sh file
```
chmod +x install.sh
```

**6.** Run install.sh to install docker
```
./install.sh
 ``` 

  or 

```
bash install.sh
```

**7.** Download docker-compose.yml files for Jenkins and SonarQube containers
```
wget -O docker-compose.yml https://raw.GitHubusercontent.com/seyramgabriel/brokencrystals/refs/heads/stable/jenkins_SonarQube/docker-compose.yml
```

**8a.** Run Jenkins and SonarQube containers
```
docker-compose up -d
```
**8b.** Check out the SonarQube and Jenkins containers
```
docker ps -a
```
_Notice the image ids and container ids_

**9.** Output the Jenkins default password in the Jenkins container
```
docker exec -it demo-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**10.** Access the Jenskins Server and install pluggins

Access jenkins on the browser with ```http://ipaddress:9090``` **example** ```http://3.131.162.22:9090```

_Install suggested initial plugins and set your new user name and password:_

* Go to "Manage jenkins", 
* Go to "Plugins", 
* Click on "Available Plugins" 
* Type "SonarQube scanner" in the search bar, check it, 
* Click "Install" on the top right corner
* Scroll down and check the restart option.

If Jenkins becomes inaccessible, go to the terminal and start the Jenkins container with this command ```docker start jenkins-container-id```

**example** 
```
docker start 00d94c57784f
```

**11.** Access the SonarQube Server

* Access SonarQube on the browser with ```http://ipaddress:9000``` **example** ```http://3.131.162.22:9000```
* Initial username and password for SonarQube are ```admin``` and ```admin``` respectively.
* Set your new password and click "Update"
* Click on "create a local project"
* Enter Project display name and Project Key, take note of these two as they will be very essential for the pipeline, in this project we use "Cloudsec" for both.
* Enter Main branch name, make sure this is the name of your main branch in the repository you will be using. In this case it is "stable"
* Click Next
* Check "Use the global setting"
* Scroll down and click "Create new project"
* Click "Project" at the top menu and notice your project display name showing, in this case it was Cloudsec

**12.** Generate a token on the SonarQube Server to be used for Jenkins pipeline

* click on "A" at the top right corner
* Enter a name for your token **example** ```Cloudsec-SonarQube-token```
* Choose "Project Analysis token" under "Type" 
* The project name **example** "Cloudsec" will populate under "Project"
* You can set your preferred duration under "Expires in" 
* Click "Generate"
* Copy and save the token securely


**13.** Configure SonarQube Scanner in Jenkins
 
* Go back to the Jenkins server
* Go to "Manage Jenkins"
* Click on "System"
* Scroll down to SonarQube Installations, check "Environmental variables" and enter a name of your choice under "Name" **example** "SonarQube", copy and paste the SonarQuber server URL under "Server URL" **example** ```http://3.131.162.22:9000/```
* For "Server authentication token" click on the "+" symbol just before "Add" and select "Jenkins"
* In the pop up window, select "secret text" under "Kind", copy and paste the generated SonarQube token under "Secret" and type something like "Secret jenkins token for sonarqube connection" under "Description", then click "Add"
* Now that the credential has been created, click on the drop down under "Server authentication token" and select the description you entered in the above step.
* Scroll down and click "Save"

* Click on "Manage Jenkins"
* Click on Tools
* Scroll down to SonarQube Scaner and enter the name as entered under "System" for "SonarQube Installations", that is "SonarQube"
* Click on "Save"

Now a connection has been created between the Jenkins Server and the SonarQube Server

**14.** Create a Jenkins pipeline job

* Click on "Dashboard" 
* Click "Create a job"
* Name your job, for **example** "SonarQube-Cloudsec-job"
* Click on "Pipeline"
* Click "OK"
* Scroll down and select "Pipeline script from SCM", select "Git" under "SCM", copy and paste your GitHub repositories URL **example** ```https://github.com/seyramgabriel/brokencrystals.git``` under "Repository URL"
* You don't need a credential if your repository is a public, like this repository
* Change the name under "Branch specifier" from "*/master" to "*/stable" as is the name of the branch we are using in this repository.
* Scroll down and ensure the "Script path" is "Jenkinsfile"
* The Jenkinsfile must be in the repository. The content of the file in this repository is:

```
node {
  stage('SCM') {
    checkout scm
  }
  stage('SonarQube Analysis') {
    def scannerHome = tool 'SonarQube';
    withSonarQubeEnv() {
      sh "${scannerHome}/bin/sonar-scanner"
    }
  }
}
```

**_You must always ensure that the name of the tool you gave under SonarQube Scanner on jenkins/tools is  same as in the pipeline script for SonarQube (**example.**"def scannerHome = tool 'SonarQube';" the name in this case is SonarQube')_**

Also check the content of "sonar-project.properties" file:

```
sonar.projectKey=Cloudsec
```
The key "Cloudsec" should be same as provided in the SonarQube project creation. 

* Click "Save"

Now a connection has been created between the GitHub repository and the Jenkins Server 


* Click on "Build Now" to trigger the pipeline


You can check the progress of the build by clicking on the drop down shown below and selecting "Console Output"

![Screenshot (91)](https://github.com/user-attachments/assets/fb12171e-fc14-4301-bc54-c544f00fb4b6)

A successful build shows a green tick in a circle.

![Screenshot (92)](https://github.com/user-attachments/assets/1c0348e8-0bd0-46ed-b9eb-a5ed18e10e81)

Now go to the SonarQube Server, Click on "Projects" and view the result of assessment as in the picture below:

![Screenshot (94)](https://github.com/user-attachments/assets/f2dd4e2f-512d-40ea-a11e-647c8db60e6d)

### GitHub Webhook

You can automate the the build trigger by using a GitHub webhook.
Steps to follow:

* Go to your GitHub repository
* Click on "Settings" 
* Click on "Webhook"
* Click on "Add webhook" and enter your GitHub password
* Enter a URL on this fashion ```http://jenkins_ipaddress:9090/github-webhook/``` as the Payload URL **example** ```http://3.131.162.22:9090/github-webhook/```

![Screenshot (95)](https://github.com/user-attachments/assets/d1bd8af8-d71d-4a1d-bd93-f7bbf958f0ad)

* Scroll down and click "Update webhook"

![Screenshot (96)](https://github.com/user-attachments/assets/82c1b083-2a9a-4c69-abbc-ae2195a8d995)

* On the Jenkins Server go to the pipeline and click on "Configure"
* Scroll down and tick "GitHub hook trigger for GITSCM polling" under "Build Triggers"

Now the pipeline will trigger automatically once there is a push to the repository on branch "stable"


# Create a GitHub pipeline for to build, tag, push and scan on dockerhub 

You can automate the build, tag, and push of images into dockerhub and use Docker Scout to scan the pushed images.
This is done by a manual trigger of the .github/workflows/Cloudsec-wf file in this repository.
The Cloudsec-wf file has three jobs for sast scan, deployment, and dast scan respectively.

Pre-requisites:
* Dockerhub account
* Dockerhub username and password
* Dockerhub repository name

Follow the steps below:

* Create a dockerhub account (If you don't already have one)
* Create a repository named brokencrystals on dockerhub
* Inside the brokencyrstals repository on dockerhub, go to "settings" and check "Docker Scout image analysis"

* Create a GitHub repository secret for your DOCKERHUB_USERNAME 
* Create a GitHub repository secret for your DOCKERHUB_TOKEN (You can use either your dockerhub password or token)

We are now ready to trigger the pipeline 

* In your GitHub repository, Click on "Actions" at the top menu
* Click on "Cloudsec-wf" on the left pane
* Click on "Run workflow"
* Make sure "sast" is selected in the pop up and click "Run workflow"

![Screenshot (107)](https://github.com/user-attachments/assets/c9898135-d8c3-4e53-ba02-981ec2a6ae05)

This will build, tag, and push your images to your dockerhub account where you can view the results of Docker Scout scan as in the picture below. The images are tagged with github.sha to reflect the image built per commit made to the repository.

![Screenshot (108)](https://github.com/user-attachments/assets/0f60ddb8-5ae1-463f-9ea6-cce22a7097d5)

# Automate deployment to AWS EKS and manage secrets with AWS Secrets Manager

After a sast scan has been performed, if you are satisfied with the security analysis or have taken remedial actions, you can go ahead to deploy the pushed images.

## Prerequisites

- **eksctl**: for managing EKS clusters.
- **AWS CLI**: to create and manage AWS resources.
- **kubectl**: to interact with the Kubernetes cluster. ([How to install kubectl utility](https://docs.aws.amazon.com/eks/latest/userguide/setting-up.html))
- **Helm**: for deploying Helm charts ([How to install helm](https://docs.aws.amazon.com/eks/latest/userguide/helm.html)).

### Create Kubernetes Cluster and ensure you have set up authentication to access AWS and your Kubernetes cluster.

---

## Steps

**1.** Create the EKS Cluster

First, we create the EKS cluster using the `cluster.yml` configuration file. Edit the metadata (name: brokencrystals
  region: us-east-2), and the nodeGroups section (instanceType: t3.medium, instanceName: brokencrystals-node,desiredCapacity: 1) to your preference.

```
eksctl create cluster -f k8s/cluster.yml
```

![Screenshot (130)](https://github.com/user-attachments/assets/b462faf1-3d34-478b-8ebc-affc903f6577)

eksctl uses AWS Cloudformation to provision the clusters and nodes, hence you can monitor the progress of creation on AWS CloudFormation. 

![Screenshot (132)](https://github.com/user-attachments/assets/bced871c-1332-4db9-b48d-e26d7f29794c)

You can scale the desired capacity of nodes from example 1 (as in the case of this project) to any later prefered number example 2, using the command below:

```
eksctl scale nodegroup --cluster=brokencrystals --name=ng-general --nodes=2 --nodes-min=1 --nodes-max=2 --region=us-east-2
```

_Please, take note, you might need to up scale the nodegroup from 1 to 2 if you use a t3.medium, for purposes of updating the application and running a dast scan seamlessly_


**2.** Install the Secrets Store CSI Driver with Helm
Add the Secrets Store CSI Driver to sync secrets from AWS Secrets Manager into Kubernetes as native secrets.

```
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm repo update
helm install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver --namespace kube-system --set syncSecret.enabled=true
```

**3.** Install AWS Secrets Manager Provider
Install the AWS Secrets Manager provider for the Secrets Store CSI Driver:

```
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml
```

This command deploys necessary configurations for accessing secrets in AWS.

**4.** Configure AWS Region and Cluster Name
Set your AWS region and cluster name to variables for ease of use in the commands below:

```
export REGION=us-east-2
export CLUSTERNAME=brokencrystals
```

**5.** Create a Secret in AWS Secrets Manager
Create a secret with database credentials in AWS Secrets Manager. Save the ARN for later use.
Alter the name, DATABASE_USER, DATABASE_PASSWORD to your preference before you run the command.

```
SECRET_ARN=$(aws --query ARN --output text secretsmanager create-secret --name db-credentials --secret-string '{"DATABASE_USER":"DevOps", "DATABASE_PASSWORD":"DevSecOps"}' --region "$REGION")
```

After successful creation, you can checkout the secret on AWS Secrets Manager

**6.** Set Up IAM Policy for Accessing Secrets
Create an IAM policy to allow access to the secret.
Replace the ARN in the command below with the one generated in the previous step. You can also replace the "brokencrystals-iam-policy" with you preferred policy name.

```
POLICY_ARN=$(aws --region "$REGION" --query Policy.Arn --output text iam create-policy --policy-name brokencrystals-iam-policy --policy-document '{
    "Version": "2012-10-17",
    "Statement": [ {
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        "Resource": ["arn:aws:secretsmanager:us-east-2:431877974142:secret:dbcredentials-uWE5Ed"]
    } ]
}')
```
Check out the 'brokencrystals-iam-policy" or whichever name you use on AWS IAM.


**7.** Create IAM Service Account
Create a Kubernetes service account and attach the IAM policy to allow access to the AWS Secrets Manager secret.

```
eksctl create iamserviceaccount --name brokencrystals-service-account --region="$REGION" --cluster "$CLUSTERNAME" --attach-policy-arn "$POLICY_ARN" --approve --override-existing-serviceaccounts
```

This command sets up the necessary IAM permissions to allow the Kubernetes application to retrieve the secret.

You can check it out on your cluster from minikube.

![Screenshot (133)](https://github.com/user-attachments/assets/58dc7318-834f-4abb-a1b8-f2573c3cfeaa)


**8.** Apply the Secret Provider YAML
Deploy the Secret Provider configuration (brokencrystals-secret-provider.yml) in Kubernetes to mount the AWS Secret as an environment variable in the BrokenCrystals application.
Replace the "objectName" and "objectVersion" with the arn and versionid of your AWS Secret respectively, before you run the comman.


```
kubectl apply -f k8s/brokencrystals-secret-provider.yml
```

![Screenshot (134)](https://github.com/user-attachments/assets/b6ccf7c9-8bb3-4274-b5c0-0ca62533c2f6)


The application can now securely access the secrets from AWS Secrets Manager.

You can run the following commands in the AWS cluster to get nodes, pods, and namespaces respectively:

```
kubectl get nodes
```

```
kubectl get pods -A
```

```
kubectl get ns
```

With the Cluster and NodeGroup ready, we are now ready to deploy into AWS EKS.
Follow the steps below to trigger the deploy job in the cloudsec-wf.yml 

* Set up repository secrets for AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
* Edit the name of the AWS EKS cluster on line 95 from "brokencrystals" to the name you gave to your cluster
* In your GitHub repository, Click on "Actions" at the top menu
* Click on "Cloudsec-wf" on the left pane
* Click on "Run workflow"
* Make sure "deploy" is selected in the pop up and click "Run workflow"

You can view the output of the workflow as it runs:

![Screenshot (135)](https://github.com/user-attachments/assets/11f0b71d-20de-46a5-a0fb-dd1cd5b1425c)

Once the deploy job is done running, the load balancer dns will output.

![Screenshot (136)](https://github.com/user-attachments/assets/cf935879-ace0-48f3-ad6d-96fbdcc4295d)

You can use the output loadbalancer dns to access the application via a web browser

![Screenshot (137)](https://github.com/user-attachments/assets/e87fe87e-fee9-4271-b9e5-801f8c87cfdb)


**_Note that, because the sast job tags the pushed images with github.sha, the deploy job should only be triggered straighaway if there is no commit to the repository after the sast job has been ran Otherwise, always trigger the sast job before the deploy job._**

Navigate to the AWS Console to view the deployment and Load balancer URL in your EKS Cluster:

![Screenshot (140)](https://github.com/user-attachments/assets/3b9e701b-8102-4ef5-a62a-99063e82ddcb)
![Screenshot (141)](https://github.com/user-attachments/assets/55eca8ed-003b-4476-90ea-964c9c5c6bfb)
![Screenshot (142)](https://github.com/user-attachments/assets/643d8d65-c69b-44fe-bb89-5470c30423f6)


# Automate OWASP ZAP DAST scan of the deployed application

The dast job in the Cloudsec-wf.yml file has been set to need deploy job, hence, once the application is deployed successfully, the dast job begins to run. The workflow dynamically picks the URL of the deployed application from the deploy job, and runs a dast scan. 

You can download and access the zap-report from the Actions tab:
![Screenshot (143)](https://github.com/user-attachments/assets/cf1339da-2e77-431b-8d1d-16e7b5f2d78f)

After downloading, unzip the report to view the full report.

![Screenshot (144)](https://github.com/user-attachments/assets/6c16a0f1-4471-479a-b24e-0cb9aaa7ae9f)
![Screenshot (145)](https://github.com/user-attachments/assets/b99af2e7-8a3e-486a-8b05-d49ca621fa0d)



# Conclusion

This is an insightful project recommended for every student and DevSecOps enthusiast.


