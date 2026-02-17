const http = require("http");
const fs = require("fs");
const path = require("path");

const port = 3000;

// Read user data from file

function getUsers() {
  const data = fs.readFileSync("./users.json", "utf-8");
  return JSON.parse(data);
}

// save user data to file

function saveUsers(users) {
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

// create server

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // serevr css file

  if (pathname === "/style.css") {
    const css = fs.readFileSync("./public/style.css");
    res.writeHead(200, { "Content-Type": "text/css" });
    return res.end(css);
  }

  // dashboard page

  if (pathname === "/") {
    const users = getUsers();
    let userRows = users
      .map(
        (user) => `
         <tr>
              <td style="text-align: center;">${user.id}</td>
              <td style="text-align: center;">${user.name}</td>
              <td style="text-align: center;">${user.email}</td>
              <td style="text-align: center;"><a href="/delete?id=${user.id}" class="delete-btn">Delete</a></td>
         </tr>
    `,
      )
      .join(" ");

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
        <html>
            <head>
                <title>Admin Panel</title>
                <link rel="stylesheet" href="/style.css">
            </head>
                <body>
                    <h1>Admin Panel</h1>
                    <h2>Add User</h2>
                
                    <form action="/add" method="POST">
                        <input type="text" name="name" placeholder="Enter name" required>
                       <input name="email" placeholder="Enter email" required />
                        <button type="submit">Add</button>
                    </form>

                    <h2>User List</h2>
                      <table>
                           <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        ${userRows}
                      </table>
                </body>
        </html>
  `);
  }

  // Add user
  else if (pathname === "/add" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const name = params.get("name");
      const email = params.get("email");

      const users = getUsers();

      const newUser = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        name,
        email,
      };

      users.push(newUser);
      saveUsers(users);

      res.writeHead(302, { Location: "/" });
      res.end();
    });
  }

  // Delete user
  else if (pathname === "/delete") {
    const id = parseInt(parsedUrl.searchParams.get("id"));
    let users = getUsers();

    users = users.filter((user) => user.id !== id);
    saveUsers(users);

    res.writeHead(302, { Location: "/" });
    res.end();
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
