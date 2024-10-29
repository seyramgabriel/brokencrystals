
## Creating a Jenkins Pipeline for SonarQube Scanning

**1.** Launch an amazon linux t2.large ec2 instance and assign ssm role

**2.** Get into the terminal via ssm on the console

**3**. Move to root user, make sure you are in the usr directory, hence run ```cd ..``` if you are in bin directory
```
sudo su
```

**4.** Run to download install.sh file to install docker
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

**7.** Download docker-compose.yml files for jenkins and sonarqube containers
```
wget -O docker-compose.yml https://raw.GitHubusercontent.com/seyramgabriel/brokencrystals/refs/heads/stable/jenkins_SonarQube/docker-compose.yml
```

**8.** Run Jenkins and SonarQube containers
```
docker-compose up -d
```

**9.** Run this command to get the jenkins default password in the jenkins container
```
docker exec -it demo-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**10.** Access the Jenskins Server

Access jenkins on the browser with http://ipaddress:9090 **eg** ```http://3.131.162.22:9090```

_Install initial plugins and set your new user name and password:_

* Go to "Manage jenkins", 
* Got to "Plugins", 
* Click on "Available Plugins" 
* Type "SonarQube scanner" in the search bar, check it, 
* Click "Install" on the top right corner
* Scroll down and check the restart option.

If Jenkins becomes inaccessible, go to the terminal and start the Jenkins container
docker start <container-id>  
**eg** 
```
docker start 00d94c57784f
```

**11.** Accessing the SonarQube Server

* Access SonarQube on the browser with ```http://ipaddress:9000``` **eg** ```http://3.131.162.22:9000```
* Initial username and password for SonarQube are ```admin``` and ```admin``` respectively.
* Set your new password and click "Update"
* Click on "create a local project"
* Enter Project display name and Project Key, take note of these two as they will be very essential for the pipeline, in this project we used "Cloudsec" for both.
* Enter Main branch name, make sure this is the name of your main branch in the repository you will be using. In this case it is "stable"
* Click Next
* Check "Use the global setting"
* Scroll down and click "Create new project"
* Click "Project" at the top menu and notice your project display name showing, in this case it was Cloudsec

**12.** Generating a token on the SonarQube Server to be used for Jenkins pipeline

* click on "A" at the top right corner
* Enter a name for your token **eg** ```Cloudsec-SonarQube-token```
* Choose "Project Analysis token" under "Type" 
* The project name **eg** "Cloudsec" will populate under "Project"
* Let the 30 days expiry under "Expires in" remain
* Click "Generate"
* Copy and save the token securely


Let's go back to the Jenkins server

**13.** Setting SonarQube environment and tool under System and Tool

* Go to "Manage Jenkins"
* Click on "System"
* Scroll down to SonarQube Installations, check "Environmental variables" and enter a name of your choice under "Name" **eg** "SonarQube", copy and paste the SonarQuber server URL under "Server URL" **eg** ```http://3.131.162.22:9000/```
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
* Name your job, for **eg** "SonarQube-Cloudsec-job"
* Click on "Pipeline"
* Click "OK"
* Scroll down and select "Pipeline script from SCM", select "Git" under "SCM", copy and paste your GitHub repositories URL **eg** ```https://GitHub.com/seyramgabriel/brokencrystals.git``` under "Repository URL"
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

**_You must always ensure that the name of the tool you gave under SonarQube Scanner on jenkins/tools is  same as in the pipeline script for SonarQube (eg."def scannerHome = tool 'SonarQube';" the name in this case is SonarQube')_**

Also check the content of "sonar-project.properties" file:

```
sonar.projectKey=Cloudsec
```
The key "Cloudsec" should be same as provided in the SonarQube project creation. 

* Click "Save"

Now a connection has been created between the GitHub repository and the Jenkins Server 


Click on "Build Now"


You can check the progress of the build by clicking on the drop down shown below and selecting "Console Output"
A successful build shows a green tick in a circle.

Now go to the SonarQube Server, Click on "Projects" and view the result of assessment as in the picture below:

### GitHub Webhook

You can automate the the build trigger by using a GitHub webhook:

* Go to your GitHub repository
* Click on "Settings" 
* Click on "Webhook"
* Click on "Edit" and enter your GitHub password
* Enter a URL on this fashion ```http://jenkins_ipaddress:9090/GitHub-webhook/``` as the Payload URL ****eg**** ```http://3.131.162.22:9090/GitHub-webhook/```
* Scroll down and click "Update webhook"
* On the Jenkins Server go to the pipeline and click on "Configure"
Scroll down and tick "GitHub hook trigger for GITScm polling" under "Build Triggers"

Now the pipeline will trigger automatically once there is a push to the repository on branch "stable"








## Description

Broken Crystals is a benchmark application that uses modern technologies and implements a set of common security vulnerabilities.

The application contains:

- React based web client
  - FE - http://localhost:3001
  - BE - http://localhost:3000
- Node.js server that serves the React client and provides both OpenAPI and GraphQL endpoints.
  The full API documentation is available via swagger or GraphQL:
  - Swagger UI - http://localhost:3000/swagger
  - Swagger JSON file - http://localhost:3000/swagger-json
  - GraphiQL UI - http://localhost:3000/graphiql

> **Note**
> The GraphQL API does not yet support all the endpoints the REST API does.

## Building and Running the Application

```bash
# build server
npm ci && npm run build

# build client
npm ci --prefix client && npm run build --prefix client

# build and start local development environment with Postgres DB, MailCatcher and the app
docker-compose --file=docker-compose.local.yml up -d

# add build flag to ensure that the images are rebuilt before starting the services
docker-compose --file=docker-compose.local.yml up -d --build
```

## Running tests by [SecTester](https://github.com/NeuraLegion/sectester-js/)

In the path [`./test`](./test) you can find tests to run with Jest.

First, you have to get a [Bright API key](https://docs.brightsec.com/docs/manage-your-personal-account#manage-your-personal-api-keys-authentication-tokens), navigate to your [`.env`](.env) file, and paste your Bright API key as the value of the `BRIGHT_TOKEN` variable:

```text
BRIGHT_TOKEN=<your_API_key_here>
```

Then, you can modify a URL to your instance of the application by setting the `SEC_TESTER_TARGET` environment variable in your [`.env`](.env) file:

```text
SEC_TESTER_TARGET=http://localhost:3000
```

Finally, you can start tests with SecTester against these endpoints as follows:

```bash
npm run test:e2e
```

Full configuration & usage examples can be found in our [demo project](https://github.com/NeuraLegion/sectester-js-demo-broken-crystals);

## Vulnerabilities Overview

- **Broken JWT Authentication** - The application includes multiple endpoints that generate and validate several types of JWT tokens. The main login API, used by the UI, is utilizing one of the endpoints while others are available via direct call and described in Swagger.

  - **No Algorithm bypass** - Bypasses the JWT authentication by using the “None” algorithm (implemented in main login and API authorization code).
  - **RSA to HMAC** - Changes the algorithm to use a “HMAC” variation and signs with the public key of the application to bypass the authentication (implemented in main login and API authorization code).
  - **Invalid Signature** - Changes the signature of the JWT to something different and bypasses the authentication (implemented in main login and API authorization code).
  - **KID Manipulation** - Changes the value of the KID field in the Header of JWT to use either: (1) a static file that the application uses or (2) OS Command that echoes the key that will be signed or (3) SQL code that will return a key that will be used to sign the JWT (implemented in designated endpoint as described in Swagger).
  - **Brute Forcing Weak Secret Key** - Checks if common secret keys are used (implemented in designated endpoint as described in Swagger). The secret token is configurable via .env file and, by default, is 123.
  - **X5U Rogue Key** - Uses the uploaded certificate to sign the JWT and sets the X5U Header in JWT to point to the uploaded certificate (implemented in designated endpoint as described in Swagger).
  - **X5C Rogue Key** - The application doesn't properly check which X5C key is used for signing. When we set the X5C headers to our values and sign with our private key, authentication is bypassed (implemented in designated endpoint as described in Swagger).
  - **JKU Rogue Key** - Uses our publicly available JSON to check if JWT is properly signed after we set the Header in JWT to point to our JSON and sign the JWT with our private key (implemented in designated endpoint as described in Swagger).
  - **JWK Rogue Key** - We make a new JSON with empty values, hash it, and set it directly in the Header, and we then use our private key to sign the JWT (implemented in designated endpoint as described in Swagger).

- **Brute Force Login** - Checks if the application user is using a weak password. The default setup contains user = _admin_ with password = _admin_

- **Common Files** - Tries to find common files that shouldn’t be publicly exposed (such as “phpinfo”, “.htaccess”, “ssh-key.priv”, etc…). The application contains .htaccess and nginx.conf files under the client's root directory and additional files can be added by placing them under the public/public directory and running a build of the client.

- **Cookie Security** - Checks if the cookie has the “secure” and HTTP only flags. The application returns two cookies (session and bc-calls-counter cookie), both without secure and HttpOnly flags.

- **Cross-Site Request Forgery (CSRF)**

  - Checks if a form holds anti-CSRF tokens, misconfigured “CORS” and misconfigured “Origin” header - the application returns "Access-Control-Allow-Origin: \*" header for all requests. The behavior can be configured in the /main.ts file.
  - The same form with both authenticated and unauthenticated user - the _Email subscription_ UI forms can be used for testing this vulnerability.
  - Different form for an authenticated and unauthenticated user - the _Add testimonial_ form can be used for testing. The forms are only available to authenticated users.

- **Cross-Site Scripting (XSS)** -

  - **Reflective XSS** can be demonstrated by using the mailing list subscription form on the landing page.
  - **Persistent XSS** can be demonstrated using add testimonial form on the landing page (for authenticated users only).

- **Default Login Location** - The login endpoint is available under /api/auth/login.

- **Directory Listing** - The Nginx config file under the nginx-conf directory is configured to allow directory listing.

- **DOM Cross-Site Scripting** - Open the landing page with the _dummy_ query param that contains DOM content (including script), add the provided DOM into the page, and execute it.

- **File Upload** - The application allows uploading an avatar photo of the authenticated user. The server doesn't perform any sort of validation on the uploaded file.

- **Full Path Disclosure** - All errors returned by the server include the full path of the file where the error has occurred. The errors can be triggered by passing wrong values as parameters or by modifying the bc-calls-counter cookie to a non-numeric value.

- **Headers Security Check** - The application is configured with misconfigured security headers. The list of headers is available in the headers.configurator.interceptor.ts file. A user can pass the _no-sec-headers_ query param to any API to prevent the server from sending the headers.

- **HTML Injection** - Both forms testimonial and mailing list subscription forms allow HTML injection.

- **CSS Injection** - The login page is vulnerable to CSS Injections through a URL parameter: https://brokencrystals.com/userlogin?logobgcolor=transparent.

- **HTTP Method fuzzer** - The server supports uploading, deletion, and getting the content of a file via /put.raw addition to the URL. The actual implementation using a regular upload endpoint of the server and the /put.raw endpoint is mapped in Nginx.

- **LDAP Injection** - The login request returns an LDAP query for the user's profile, which can be used as a query parameter in /api/users/ldap _query_ query parameter. The returned query can be modified to search for other users. If the structure of the LDAP query is changed, a detailed LDAP error will be returned (with LDAP server information and hierarchy).

- **Local File Inclusion (LFI)** - The /api/files endpoint returns any file on the server from the path that is provided in the _path_ param. The UI uses this endpoint to load crystal images on the landing page.

- **Mass Assignment** - You can add to user admin privileges upon creating user or updating userdata. When you are creating a new user /api/users/basic you can use additional hidden field in body request { ... "isAdmin" : true }. If you are trying to edit userdata with PUT request /api/users/one/{email}/info you can add this additional field mentioned above. For checking admin permissions there is one more endpoint: /api/users/one/{email}/adminpermission.

- **Open Database** - The index.html file includes a link to manifest URL, which returns the server's configuration, including a DB connection string.

- **OS Command Injection** - The /api/spawn endpoint spawns a new process using the command in the _command_ query parameter. The endpoint is not referenced from UI.

- **Remote File Inclusion (RFI)** - The /api/files endpoint returns any file on the server from the path that is provided in the _path_ param. The UI uses this endpoint to load crystal images on the landing page.

- **Secret Tokens** - The index.html file includes a link to manifest URL, which returns the server's configuration, including a Google API key.

- **Server-Side Template Injection (SSTI)** - The endpoint /api/render receives a plain text body and renders it using the doT (http://github.com/olado/dot) templating engine.

- **Server-Side Request Forgery (SSRF)** - The endpoint /api/file receives the _path_ and _type_ query parameters and returns the content of the file in _path_ with Content-Type value from the _type_ parameter. The endpoint supports relative and absolute file names, HTTP/S requests, as well as metadata URLs of Azure, Google Cloud, AWS, and DigitalOcean.
  There are specific endpoints for each cloud provider as well - `/api/file/google`, `/api/file/aws`, `/api/file/azure`, `/api/file/digital_ocean`.

- **SQL injection (SQLi)** - The `/api/testimonials/count` endpoint receives and executes SQL query in the query parameter. Similarly, the `/api/products/views` endpoint utilizes the `x-product-name` header to update the number of views for a product. However, both of these parameters can be exploited to inject SQL code, making these endpoints vulnerable to SQL injection attacks.

- **Unvalidated Redirect** - The endpoint /api/goto redirects the client to the URL provided in the _url_ query parameter. The UI references the endpoint in the header (while clicking on the site's logo) and as a href source for the Terms and Services link in the footer.

- **Version Control System** - The client_s build process copies SVN, GIT, and Mercurial source control directories to the client application root, and they are accessible under Nginx root.

- **XML External Entity (XXE)** - The endpoint, POST /api/metadata, receives URL-encoded XML data in the _xml_ query parameter, processes it with enabled external entities (using `libxmljs` library) and returns the serialized DOM. Additionally, for a request that tries to load file:///etc/passwd as an entity, the endpoint returns a mocked up content of the file.
  Additionally, the endpoint PUT /api/users/one/{email}/photo accepts SVG images, which are processed with libxml library and stored on the server, as well as sent back to the client.

- **JavaScript Vulnerabilities Scanning** - Index.html includes an older version of the jQuery library with known vulnerabilities.

- **AO1 Vertical access controls** - The page /dashboard can be reached despite the rights of user.

- **Broken Function Level Authorization** - The endpoint DELETE `/users/one/:id/photo?isAdmin=` can be used to delete any user's profile photo by enumerating the user IDs and setting the `isAdmin` query parameter to true, as there is no validation of it's value on the server side.

- **IFrame Injection** - The `/testimonials` page a URL parameter `videosrc` which directly controls the src attribute of the IFrame at the bottom of this page. Similarly, the home page takes a URL param `maptitle` which directly controls the `title` attribute of the IFrame at the CONTACT section of this page.

- **Excessive Data Exposure** - The `/api/users/one/:email` is supposed to expose only basic user information required to be displayed on the UI, but it also returns the user's phone number which is unnecessary information.

- **Business Constraint Bypass** - The `/api/products/latest` endpoint supports a `limit` parameter, which by default is set to 3. The `/api/products` endpoint is a password protected endpoint which returns all the products, yet if you change the `limit` param of `/api/products/latest` to be high enough you could get the same results without the need to be authenticated.

- **ID Enumeration** - There are a few ID Enumeration vulnerabilities:

  1. The endpoint DELETE `/users/one/:id/photo?isAdmin=` which is used to delete a user's profile picture is vulnerable to ID Enumeration together with [Broken Function Level Authorization](#broken-function-level-authorization).
  2. The `/users/id/:id` endpoint returns user info by ID, it doesn't require neither authentication nor authorization.

- **XPATH Injection** - The `/api/partners/*` endpoint contains the following XPATH injection vulnerabilities:

  1. The endpoint GET `/api/partners/partnerLogin` is supposed to log in with the user's credentials in order to obtain account info. It's vulnerable to an XPATH injection using boolean based payloads. When exploited it'll retrieve data about other users as well. You can use `' or '1'='1` in the password field to exploit the EP.
  2. The endpoint GET `/api/partners/searchPartners` is supposed to search partners' names by a given keyword. It's vulnerable to an XPATH injection using string detection payloads. When exploited, it can grant access to sensitive information like passwords and even lead to full data leak. You can use `')] | //password%00//` or `')] | //* | a[('` to exploit the EP.
  3. The endpoint GET `/api/partners/query` is a raw XPATH injection endpoint. You can put whatever you like there. It is not referenced in the frontend, but it is an exposed API endpoint.
  4. Note: All endpoints are vulnerable to error based payloads.

- **Prototype Pollution** - The `/marketplace` endpoint is vulnerable to prototype pollution using the following methods:

  1. The EP GET `/marketplace?__proto__[Test]=Test` represents the client side vulnerability, by parsing the URI (for portfolio filtering) and converting
     its parameters into an object. This means that a requests like `/marketplace?__proto__[TestKey]=TestValue` will lead to a creation of `Object.TestKey`.
     One can test if an attack was successful by viewing the new property created in the console.
     This EP also supports prototype pollution based DOM XSS using a payload such as `__proto__[prototypePollutionDomXss]=data:,alert(1);`.
     The "legitimate" code tries to use the `prototypePollutionDomXss` parameter as a source for a script tag, so if the exploit is not used via this key it won't work.
  2. The EP GET `/api/email/sendSupportEmail` represents the server side vulnerability, by having a rookie URI parsing mistake (similar to the client side).
     This means that a request such as `/api/email/sendSupportEmail?name=Bob%20Dylan&__proto__[status]=222&to=username%40email.com&subject=Help%20Request&content=Help%20me..`
     will lead to a creation of `uriParams.status`, which is a parameter used in the final JSON response.

- **Date Manipulation** - The `/api/products?date_from={df}&date_to={dt}` endpoint fetches all products that were created between the selected dates. There is no limit on the range of dates and when a user tries to query a range larger than 2 years querying takes a significant amount of time. This EP is used by the frontend in the `/marketplace` page.

- **Email Injection** - The `/api/email/sendSupportEmail` is vulnerable to email injection by supplying tempered recipients.
  To exploit the EP you can dispatch a request as such `/api/email/sendSupportEmail?name=Bob&to=username%40email.com%0aCc:%20bob@domain.com&subject=Help%20Request&content=I%20would%20like%20to%20request%20help%20regarding`.
  This will lead to the sending of a mail to both `username@email.com` and `bob@domain.com` (as the Cc).
  Note: This EP is also vulnerable to `Server side prototype pollution`, as mentioned in this README.

- **Insecure Output Handling** - The `/chat` route is vulnerable to non-sanitized output originating from the LLM response.
  Issue a `POST /api/chat` request with body payload like `[{"content": "Provide a minimal html markup for img tag with invalid source and onerror attribute with alert", "role": "user"}]`.
  The response will include raw HTML code. If this output is not properly sanitized before rendering, it can trigger an alert box in the user interface.
