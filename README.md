# fastvm
A try for faster setting up virtual servers  
Using [qemu](https://www.qemu.org/)  

## What?
This repo contains mostly test files for a part of a project i would like to make  
I would like as part of that project to create VMs super fast like [digitalocean](https://www.digitalocean.com/) and a lot of others do  

## The Idea in steps?
### As prepreperation before someone can create faster a vm (only need to do this once for every os: debian, ubuntu, fedora)  
- Create a virtual harddisk around 2gb depending on the OS and make sure it is resizeble  
- Install the OS (not sure how to install something like ubuntu server without useing a screen)  
- Mount the virtual harddisk to the server and change the settings inside the mounted folder (maybe using chroot)  
- OR use ssh to get into the just created server  
### To fast create a vm  
- Copy the vm  
- Mount *& chroot* into the system and change ip, swap, default pass, etc  
- Open vm  
- Create link to domain, ip OR use custom ssh port  
- Working VM... (send ip, username, password, etc to the client)    
And this all mostly in dockercontainers to make it more scalible and a easier to work with.  
Also It would be nice to have a status stream to the web or a server for checking the status  
