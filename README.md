## Description
A scalable API server that supports image/file upload. 

## Design Overview
This backend server is built on top of [NestJS](https://nestjs.com/) with [Bull](https://optimalbits.github.io/bull/) as the message queue for handling distributed jobs. The code is also wriiten to be extensible so that in the future it could also support other types of file upload.<br>
The design essentially utilizes a message queue and the main server is responsible for creating an `UploadJob` and enquing the job. Depending on the configurations, once there is a idle worker server, it should be able to consume a job from the queue to run some image-processing or any ETL process.

## System Diagram
![alt text](https://github.com/jiehangWu/image-repository/blob/master/resource/imageRepo.png?raw=true)

## API
* **URL**

  `/upload/file`
  
* **Functionality:**
  This endpoint should get the image from paylaod and persist it in folder `upload` under the project root folder. It should also outputs a bluured image to the folder `output`.

* **Method:**
  `POST` 
  
* **Sample Request:**
 `
 {"file": <Your file/image>}
 `

* **Success Response:**

  * **Code:** 200 <br />
    **Content:** `{"files": [<file>],
    "jobId": <Job Id>}`
 
* **Error Response:**
  * **Code:** 400 Bad Request <br />
    **Content:** `{ "Can not extract file from request or file is not in supported format" }`

  OR

  * **Code:** 500 Internal Sever Error <br />



## Installation

```bash
$ npm install
```
This app depends on [Redis](https://redis.io/) so installing is is required.
* **With Docker**
  ```bash
  docker pull redis
  ```
  After pulling the image, simply run:
  ```bash
  docker run -d --name <name> -p 6379:6379 redis
  ```
If not using Docker, [here](https://redis.io/topics/quickstart) is a guide on how to start Redis on your local machine.

## Running the App

```bash
# start the app
$ npm start
```

## Future Improvements
- [ ] Add testing
- [ ] Even thought the actual job processing supports multiple files, the endpoint so far can only take one file. Other endpoints can be added to take more files per upload
- [ ] There could be a separat endpoint to trigger image processing tasks instead of using one endpoint for both uploading and image processing
- [ ] Endpoint guard/authorization
- [ ] Process files/images in chunks to make sure they fit in memory

