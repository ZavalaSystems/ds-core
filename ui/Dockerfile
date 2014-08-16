FROM ubuntu:14.04

RUN echo "deb http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" > /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN echo "deb-src http://ppa.launchpad.net/nginx/stable/ubuntu trusty main" >> /etc/apt/sources.list.d/nginx-stable-trusty.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C300EE8C
RUN apt-get update
RUN apt-get install -y nginx-extras
ADD . /opt/gsati/ui
RUN cp /opt/gsati/ui/gsati-ui /etc/nginx/sites-enabled/gsati-ui
RUN cp /opt/gsati/ui/nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default

WORKDIR /etc/nginx
CMD ["nginx"]

EXPOSE 80
EXPOSE 443