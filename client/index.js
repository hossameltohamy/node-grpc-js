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
const greetclient = new greetPackageDefinition.GreetService("localhost:50052",
        grpc.credentials.createInsecure()
)
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
const blogclient = new blogPackageDefinition.BlogService("localhost:50052",
        grpc.credentials.createInsecure()
)
 
 
let fs = require("fs");
const { request } = require('http');

let credentials = grpc.credentials.createSsl(
  fs.readFileSync(path.join(__dirname,'../certs','ca.crt')),
  fs.readFileSync(path.join(__dirname,'../certs','client.key')),
  fs.readFileSync(path.join(__dirname,'../certs','client.crt'))
);

let unsafCreds = grpc.credentials.createInsecure();

function callListBlogs() {
  console.log('callListBlogs');
  
  //request as empty
  emptyBlogRequest={}
  var call = blogclient.listBlog(emptyBlogRequest, () => {});

  call.on("data", response => {
    console.log("Client Streaming Response ", response.blog);
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("End");
  });
}

function callCreateBlog() {
  

  var CreateBlogRequest = {blog:{}};

  CreateBlogRequest.blog.author="Hossam";
  CreateBlogRequest.blog.title="Hossam yahia";
  CreateBlogRequest.blog.content="This is okay...";

  blogclient.createBlog(CreateBlogRequest, (error, response) => {
    if (!error) {
      console.log("Received create blog response,", response.blog);
    } else {
      console.error(error);
    }
  });
}

 


function callReadBlog() {
 console.log('readblog');
  var readBlogRequest = {}
  readBlogRequest.blog_id=6;

  blogclient.readBlog(readBlogRequest, (error, response) => {
    if (!error) {
      console.log("Found a blog ", response.blog);
    } else {
      if (error.code === grpc.status.NOT_FOUND) {
        console.log("Not found");
      } else {
        //do something else...
        console.log(error);
      }
    }
  });
}

function callUpdateBlog() {
 
  var updateBlogRequest = {blog:{}};

   

  updateBlogRequest.blog.id="6";
  updateBlogRequest.blog.author="James Bond now";
  updateBlogRequest.blog.title="Hello Up to date";
  updateBlogRequest.blog.content="This is great, again!";

 
  console.log("Blog...", updateBlogRequest.blog);

  blogclient.updateBlog(updateBlogRequest, (error, response) => {
    if (!error) {
    } else {
      if (error.code === grpc.status.NOT_FOUND) {
        console.log("NOt found");
      } else {
        ///do more...
      }
    }
  });
}

function callDeleteBlog() {
  var deleteBlogRequest = {};
  var blogId = "6";

  deleteBlogRequest.blog_id=blogId;

  blogclient.deleteBlog(deleteBlogRequest, (error, response) => {
    if (!error) {
      console.log("Deleted blog with id: ", response);
    } else {
      if (error.code === grpc.status.NOT_FOUND) {
        console.log("Not Found");
      } else {
        console.log("Sorry something went wrong");
      }
    }
  });
}
function callGreetings() {
  console.log("Hello From Client"); 
  // create our request
  var request = {
    greeting: {
         first_name: "hossam",
         last_name: "yahia"
    }
}

greetclient.greet(request, (error, response) => {
    if (!error) {
      console.log("Greeting Response: ", response.result);
    } else {
      console.error(error);
    }
  });
}

function callGreetManyTimes() {
 

  // create request
  var request = {greeting:{}};

  
  request.greeting.first_name="hossam";
  request.greeting.last_name="yahia";
  var call = greetclient.greetManyTimes(request, () => {});

  call.on("data", response => {
    console.log("Client Streaming Response: ", response.result);
  });

  call.on("status", status => {
    console.log(status.details);
  });

  call.on("error", error => {
    console.error(error.details);
  });

  call.on("end", () => {
    console.log("Streaming Ended!");
  });
}

function callLongGreeting() {
 

  var request = {greet:{}}

  var call = greetclient.longGreet(request, (error, response) => {
    if (!error) {
      console.log("Server Response: ", response.result);
    } else {
      console.error(error);
    }
  });

  let count = 0,
    intervalID = setInterval(function() {
      console.log("Sending message " + count);

      var requestOne = {greet:{}}
      requestOne.greet.first_name="hossam";
      requestOne.greet.last_name="yahia";

 
      var requestTwo = {greet:{}}
      requestTwo.greet.first_name="mohamed";
      requestTwo.greet.last_name="yahia";

 
      call.write(requestOne);
      call.write(requestTwo);

      if (++count > 3) {
        clearInterval(intervalID);
        call.end(); //we have sent all the messages!
      }
    }, 1000);
}

function callSum() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  var sumRequest = new calc.SumRequest();

  sumRequest.setFirstNumber(10);
  sumRequest.setSecondNumber(15);

  client.sum(sumRequest, (error, response) => {
    if (!error) {
      console.log(
        sumRequest.getFirstNumber() +
          " + " +
          sumRequest.getSecondNumber() +
          " = " +
          response.getSumResult()
      );
    } else {
      console.error(error);
    }
  });
}

function callPrimeNumberDecomposition() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  var request = new calc.PrimeNumberDecompositionRequest();

  var number = 12; //567890

  request.setNumber(number);

  var call = client.primeNumberDecomposition(request, () => {});

  call.on("data", response => {
    console.log("Prime Factors Found: ", response.getPrimeFactor());
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("status", status => {
    console.log(status);
  });

  call.on("end", () => {
    console.log("Streaming Ended!");
  });
}


function callComputeAverage() {
  var client = new calcService.CalculatorServiceClient(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  var request = new calc.ComputeAverageRequest();

  var call = client.computeAverage(request, (error, response) => {
    if (!error) {
      console.log(
        "Received a response from the server - Average: " +
          response.getAverage()
      );
    } else {
      console.error(error);
    }
  });

  var request = new calc.ComputeAverageRequest();
  // request.setNumber(1)

  for (var i = 0; i < 1000000; i++) {
    var request = new calc.ComputeAverageRequest();
    request.setNumber(i);
    call.write(request);
  }

  call.end();

  // var requestTwo = new calc.ComputeAverageRequest()
  // requestTwo.setNumber(2)

  // var requestThree = new calc.ComputeAverageRequest()
  // requestThree.setNumber(3)

  // var requestFour = new calc.ComputeAverageRequest()
  // requestFour.setNumber(4)

  // average should be 2.5

  //  call.write(request)
  //  call.write(requestTwo)
  //  call.write(requestThree)
  //  call.write(requestFour)

  //  call.end() // we are done sending messages
}



async function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  });
}

async function callBiDiFindMaximum() {
  // Created our server client
  console.log("hello I'm a gRPC Client");

  var client = new calcService.CalculatorServiceClient(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  var call = client.findMaximum(request, (error, response) => {});

  call.on("data", response => {
    console.log("Got new Max from Server => " + response.getMaximum());
  });
  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("Server is completed sending messages");
  });

  // data
  let data = [3, 5, 17, 9, 8, 30, 12, 345, 129, 0];
  for (var i = 0; i < data.length; i++) {
    var request = new calc.FindMaximumRequest();
    console.log("Sending number: " + data[i]);

    request.setNumber(data[i]);
    call.write(request);
    await sleep(1000);
  }
  call.end(); // we are done sending messages
}

async function callBiDirect() {
  // Created our server client
  console.log("hello I'm a gRPC Client");

 
  var request={greet:{}}
  var call = greetclient.greetEveryone(request, (error, response) => {
    console.log("Server Response: " + response);
  });

  call.on("data", response => {
    console.log("Hello Client!" + response.result);
  });

  call.on("error", error => {
    console.error(error);
  });

  call.on("end", () => {
    console.log("Client The End");
  });

  for (var i = 0; i < 10; i++) {
     var greeteveryonerequest = {greet:{}};
     greeteveryonerequest.greet.first_name="hossam";
     greeteveryonerequest.last_name="yahia";

 
    call.write(greeteveryonerequest);

    await sleep(1500);
  }

  call.end();
}

function getRPCDeadline(rpcType) {
  timeAllowed = 5000;

  switch (rpcType) {
    case 1:
      timeAllowed = 10;
      break;

    case 2:
      timeAllowed = 7000;
      break;

    default:
      console.log("Invalid RPC Type: Using Default Timeout");
  }

  return new Date(Date.now() + timeAllowed);
}

function doErrorCall() {
  var deadline = getRPCDeadline(1);

  // Created our server client
  console.log("hello I'm a gRPC Client");

  var client = new calcService.CalculatorServiceClient(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  var number = -1;
  var squareRootRequest = new calc.SquareRootRequest();
  squareRootRequest.setNumber(number);

  client.squareRoot(
    squareRootRequest,
    { deadline: deadline },
    (error, response) => {
      if (!error) {
        console.log("Square root is ", response.getNumberRoot());
      } else {
        console.log(error.message);
      }
    }
  );
}

function main() {
  callGreetings();
  callGreetManyTimes();
  callLongGreeting(); 
   //callDeleteBlog();
  // callUpdateBlog();
  //callReadBlog();
  //callUpdateBlog();
  //callCreateBlog();
  // callListBlogs();
  // callSum();
  // doErrorCall();
  // callBiDiFindMaximum();
  // callComputeAverage();
  // callPrimeNumberDecomposition();
  //callBiDirect();
  
  
}
main();
