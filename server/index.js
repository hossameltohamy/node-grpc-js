const path = require('path')
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');


//grpc service definition for greet
const greetProtoPath = path.join(__dirname, "..", "protos", "greet.proto")
const greetProtoDefinition = protoLoader.loadSync(greetProtoPath, {
     keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
});
const greetPackageDefinition = grpc.loadPackageDefinition(greetProtoDefinition).greet

//grpc service definition for blog crud api 
const blogProtoPath = path.join(__dirname, "..", "protos", "blog.proto")
const blogProtoDefinition = protoLoader.loadSync(blogProtoPath, {
     keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
});
const blogPackageDefinition = grpc.loadPackageDefinition(blogProtoDefinition).blog






const fs = require("fs");


//Knex requires
const environment = process.env.ENVIRONMENT || "development";
const config = require("./knexfile")[environment];
const knex = require("knex")(config);

/*
  Implements the greet RPC method.
*/

/*
   Blog CRUD 
*/

function listBlog(call, callback) {
  console.log("Received list blog request");
  knex("blogs").then(data => {
    data.forEach(element => {
       var blogResponse ={
         blog:{

         }
       };
       blogResponse.blog.id=element.id;
       blogResponse.blog.author= element.author;
       blogResponse.blog.title=element.title;
       blogResponse.blog.content=element.content;
      //write to the stream
      console.log(blogResponse);
      call.write(blogResponse);
    });
    call.end(); // we are done writing!!
  });
}

function createBlog(call, callback) {
  console.log("Received Create Blog Request");

  var blog = call.request.blog

  console.log("Inserting a Blog...");

  knex("blogs")
    .insert({
      author: blog.author,
      title: blog.title,
      content: blog.content
    })
    .then(() => {
      var id = blog.id;

      var addedBlog = {blog:{}}

      //set the blog response to be returned
      addedBlog.blog.id;
      addedBlog.blog.author;
      addedBlog.blog.title=blog.title;
      addedBlog.blog.content=blog.content;

    

      console.log("Inserted Blog with ID: ", addedBlog.blog.id);

      callback(null,addedBlog);
    });
}

function readBlog(call, callback) {
  console.log("Received Blog request");

  // get id
  var blogId = call.request.blog_id;
  console.log('blogId',call.request);

  knex("blogs")
    .where({ id: parseInt(blogId) })
    .then(data => {
      console.log("Searching for a blog...");

      if (data.length) {
        var blogResponse = {blog:{}};

        console.log("Blog found and sending message");

        //set the blog response to be returned
        blogResponse.blog.id=blogId;
        blogResponse.blog.author=data[0].author;
        blogResponse.blog.title=data[0].title;
        blogResponse.blog.content=data[0].content;

       

        callback(null, blogResponse);
      } else {
        console.log("Blog not found");
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Blog Not found!"
        });
      }
    });
}

function updateBlog(call, callback) {
  console.log("Received updated Blog Request");

  var blogId = call.request.blog.id;

  console.log("Searching for a blog to update....");

  knex("blogs")
    .where({ id: parseInt(blogId) })
    .update({
      author: call.request.blog.author,
      title: call.request.blog.title,
      content: call.request.blog.content
    })
    .returning()
    .then(data => {
      if (data) {
        var blogResponse = {blog:{}}

        console.log("Blog found sending message...");

        //set the blog response
        blogResponse.blog.id=blogId;
        blogResponse.blog.author=data.author;
        blogResponse.blog.title=data.title;
        blogResponse.blog.content=data.content;
        console.log("Updated ===", blogResponse.blog.id);

        callback(null, blogResponse);
      } else {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Blog with the corresponding id was not found"
        });
      }
    });
}

function deleteBlog(call, callback) {
  console.log("Received Delete Blog request");

  var blogId = call.request.blog_id;

  knex("blogs")
    .where({ id: parseInt(blogId) })
    .delete()
    .returning()
    .then(data => {
      console.log("Blog deleting...");

      if (data) {
        var deleteResponse = {};
        deleteResponse.blog_id=blogId;

        console.log(
          "Blog request is now deleted with id: ",
          deleteResponse.toString()
        );

        callback(null, deleteResponse);
      } else {
        console.log("Nope....");

        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Blog with the corresponding id was not found"
        });
      }
    });
}



function greetManyTimes(call, callback) {
  var firstName = call.request.greeting.first_name;
  console.log(call.request.greeting);
  let count = 0,
    intervalID = setInterval(function() {
      var greetManyTimesResponse = {};
      greetManyTimesResponse.result=firstName;
   console.log(greetManyTimesResponse);
      // setup streaming
      call.write(greetManyTimesResponse);
      if (++count > 9) {
        clearInterval(intervalID);
        call.end(); // we have sent all messages!
      }
    }, 1000);
}

// greet functions
function longGreet(call, callback) {
  call.on("data", request => {
    var fullName =
      request.greet.first_name +
      " " +
      request.greet.last_name;

    console.log("Hello " + fullName);
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    var response = {}
    response.result="Long Greet Client Streaming....."; 
    callback(null, response);
  });
}




function greet(call, callback) {
  var firstName = call.request.greeting.first_name;
  var lastName = call.request.greeting.last_name;

  callback(null, {result: "Hello " + firstName + " " + lastName})

}
async function greetEveryone(call, callback) {
  call.on("data", response => {
    var fullName =
      response.greet.first_name +
      " " +
      response.greet.last_name;

    console.log("Hello " + fullName);
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("Server The End...");
  });

  for (var i = 0; i < 10; i++) {
    var request ={};
    request.result="mgreeting all";  
    call.write(request);
    await sleep(1000);
  }

  call.end();
}


 //sum 
function sum(call, callback) {
  var sumResponse = new calc.SumResponse();

  sumResponse.setSumResult(
    call.request.getFirstNumber() + call.request.getSecondNumber()
  );

  callback(null, sumResponse);
}

//primeFactor -
function primeNumberDecomposition(call, callback) {
  var number = call.request.getNumber();
  var divisor = 2;

  console.log("Received number: ", number);

  while (number > 1) {
    if (number % divisor === 0) {
      var primeNumberDecompositionResponse = new calc.PrimeNumberDecompositionResponse();

      primeNumberDecompositionResponse.setPrimeFactor(divisor);

      number = number / divisor;

      //write the message using call.write()
      call.write(primeNumberDecompositionResponse);
    } else {
      divisor++;
      console.log("Divisor has increased to ", divisor);
    }
  }

  call.end(); // all messages sent! we are done
}

function computeAverage(call, callback) {
  // running sum and count
  var sum = 0;
  var count = 0;

  call.on("data", request => {
    // increment sum
    sum += request.getNumber();

    console.log("Got number: " + request.getNumber());

    // increment count
    count += 1;
  });
  call.on("error", error => {
    console.log(error);
  });

  call.on("end", () => {
    // compute the actual average

    var average = sum / count;

    var response = new calc.ComputeAverageResponse();
    response.setAverage(average);

    callback(null, response);
  });
}
async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}

// - FindMaximum - Solution
function findMaximum(call, callback) {
  var currentMaximum = 0;
  var currentNumber = 0;

  call.on("data", request => {
    currentNumber = request.getNumber();

    if (currentNumber > currentMaximum) {
      currentMaximum = currentNumber;

      var response = new calc.FindMaximumResponse();
      response.setMaximum(currentMaximum);

      call.write(response);
    } else {
      //do nothing
    }

    console.log("Streamed number: ", request.getNumber());
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    var response = new calc.FindMaximumResponse();
    response.setMaximum(currentMaximum);

    call.write(response);

    call.end();
    console.log("The end!");
  });
}


function squareRoot(call, callback) {
  var number = call.request.getNumber();

  if (number >= 0) {
    var numberRoot = Math.sqrt(number);
    var response = new calc.SquareRootResponse();
    response.setNumberRoot(numberRoot);

    callback(null, response);
  } else {
    // Error handling
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message:
        "The number being sent is not positive " + " Number sent: " + number
    });
  }
}

function main() {
  let credentials = grpc.ServerCredentials.createSsl(
    fs.readFileSync(path.join(__dirname,'../certs','ca.crt')),
    [
      {
        cert_chain: fs.readFileSync(path.join(__dirname,'../certs','server.crt')),
        private_key: fs.readFileSync(path.join(__dirname,'../certs','server.key'))
      }
    ],
    true
  );
  let unsafeCreds = grpc.ServerCredentials.createInsecure();

  
  var server = new grpc.Server();
  server.addService(blogPackageDefinition.BlogService.service, {
     listBlog: listBlog,
     createBlog: createBlog,
     readBlog: readBlog,
     updateBlog: updateBlog,
     deleteBlog: deleteBlog
  });

  // server.addService(calcService.CalculatorServiceService, {
  //   sum: sum,
  //   primeNumberDecomposition: primeNumberDecomposition,
  //   computeAverage: computeAverage,
  //   findMaximum: findMaximum,
  //   squareRoot: squareRoot
  // });

  server.addService(greetPackageDefinition.GreetService.service, {
    greet: greet,
    longGreet:longGreet,
    greetEveryone:greetEveryone,
    greetManyTimes:greetManyTimes



})
server.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50052");
    server.start();
  }
);
}

main();
