call yarn run build
call ssh root@172.16.99.82 "rm -rf /usr/local/nginx/project/scm/*"
call scp -r D:/Code/sc-scm-front/dist/* root@172.16.99.82:/usr/local/nginx/project/scm
