
import socket
import time
import signal

# Live coding:
# 0. Show how you would load this into your IDE.
# 1. Walk through the parts of handling a HTTP request.
# 2. Run and connect to this server in the browser.
# 3. Create a file called hello.html containing the message, "Hello, World!".
# 4. Set the response body to the read-in contents of hello.html.
#       Now you should be able to change hello.html and refresh the browser to see the changes, without restarting the server!

def main():

    server = create_connection(port = 8082)

    while True:
        connection_to_browser = accept_browser_connection_to(server)

        with(connection_to_browser):

            reader_from_browser = connection_to_browser.makefile(mode='rb')
            writer_to_browser = connection_to_browser.makefile(mode='wb')
            
            with(reader_from_browser):
                try:
                    request_line = str(reader_from_browser.readline())
                    file_name = "." + request_line.split(' ')[1]
                    file_extension = file_name.split(".")[2]
                    print()
                    print('Requested file:', file_name)
                    print('Extension:', file_extension)
                except socket.timeout:
                    continue
                except KeyboardInterrupt:
                    exit(0)
                except Exception as e:
                    print(e)

            if(file_name == "./shutdown"):
                exit()

            with(writer_to_browser):
                try:
                    with(open(file_name, "rb") as fd):
                        response_body = bytearray(fd.read())
                        if(file_extension == "html"):
                            content_type = 'text/html; charset=utf-8'
                        elif(file_extension == "png"):
                            content_type = 'image/png'
                        elif(file_extension == "jpeg"):
                            content_type = 'image/jpeg'
                        elif(file_extension == "js"):
                            content_type = 'text/javascript; charset=utf-8'
                        elif(file_extension == "css"):
                            content_type = 'text/css; charset=utf-8'

                    response_headers = bytearray("\r\n".join([
                        'HTTP/1.1 200 OK',
                        f'Content-Type: {content_type}',
                        f'Content-length: {len(response_body)}',
                        'Connection: close',
                        '\r\n'
                    ]), encoding = "utf-8")

                    print()
                    print('Response headers:')
                    print(response_headers)
                    print()
                    print('Response body:')
                    print(response_body)
                    print()

                    writer_to_browser.write(response_headers)
                    writer_to_browser.write(response_body)
                    writer_to_browser.flush()
                except Exception as e:
                    print(e)



def create_connection(port):
    addr = ("", port)  # "" = all network adapters; usually what you want.
    server = socket.create_server(addr)
    server.settimeout(2)
    print(f'Server started on port {port}. Try: http://localhost:{port}/public/index.html')
    return server

def accept_browser_connection_to(server):
    while True:
        try:
            (conn, address) = server.accept()
            conn.settimeout(2)
            return conn
        except socket.timeout:
            print(".", end="", flush=True)
        except KeyboardInterrupt:
            exit(0)

main()