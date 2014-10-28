# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "vagrant-trusty64"

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 2048
    vb.cpus = 2
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
  end

  config.vm.network "forwarded_port", guest: 5984, host: 5984
  config.vm.network "forwarded_port", guest: 7474, host: 7575

  config.vm.provision "ansible" do |ansible|
    ansible.playbook = "devops/development.yml"
  end
end

#trigger build
