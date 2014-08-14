FROM likwid/stuff:latest

RUN echo "deb http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" > /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN echo "deb-src http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" >> /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C300EE8C
RUN apt-get update
RUN apt-get install -y  wget nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
#fix for long server names
RUN sed -i 's/# server_names_hash_bucket/server_names_hash_bucket/g' /etc/nginx/nginx.conf

ADD devops/gsati-ui /etc/nginx/sites-enabled/gsati-ui

WORKDIR /etc/nginx
CMD ["nginx"]

EXPOSE 80
EXPOSE 443