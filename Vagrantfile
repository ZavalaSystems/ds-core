# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
$update_channel = "alpha"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.network "forwarded_port", guest: 8080, host: 8080
  config.vm.network "forwarded_port", guest: 5000, host: 5000
  config.vm.network "private_network", ip: "192.168.50.10", virtualbox__intnet: "true"
  config.vm.provider "virtualbox" do |vb|
     vb.customize ["modifyvm", :id, "--memory", "2048"]
  end
end

# $update_channel = "alpha"

# # Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
# VAGRANTFILE_API_VERSION = "2"

# Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

#   config.vm.define "devops" do |devops|
#     devops.vm.box = "http://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"
#     devops.vm.network "forwarded_port", guest: 8080, host: 8080
#     devops.vm.network "forwarded_port", guest: 5000, host: 5000
#     devops.vm.network "private_network", ip: "192.168.50.1", virtualbox__intnet: "true"
#     devops.vm.provider "virtualbox" do |vb|
#        vb.customize ["modifyvm", :id, "--memory", "2048"]
#     end
#   end

#   config.vm.define "docker_host" do |docker_host|
#     docker_host.vm.box = "coreos-%s" % $update_channel
#     docker_host.vm.box_version = ">= 308.0.1"
#     docker_host.vm.box_url = "http://%s.release.core-os.net/amd64-usr/current/coreos_production_vagrant.json" % $update_channel
#     docker_host.vm.network "private_network", ip: "192.168.50.2", virtualbox__intnet: "true"
#     docker_host.vm.provider "virtualbox" do |vb|
#        vb.customize ["modifyvm", :id, "--memory", "2048"]
#     end
#   end

# end
