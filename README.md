# How to use http to communicate with the server
## Reset conf to backup_conf.json

If you want to reset your configuration file with the backup_conf.json simply query the following:

``<ip>:<port>/data?a=reset``



## Retrieve request

If you want to retrieve the conf.json send a request with the following syntax (a stand for action and r for retrive):

`<ip>:<port>/data?a=r`



## Add light request

If you want to add a light to the server conf.json you have to send the following request (the action al stands for add light):

`<ip>:<port>/data?a=al&i=<id>&c=<code>&n=<name>`

- The ID has to be in decimal representation, the server converts it to binary internally

## Remove light request

If you want to remova a light from the server conf.json, send the following command (rl=remove light):

`<ip>:<port>/data?a=rl&i=<id>`

- The ID here is the binary representation

## Add group to light

If you want to add a group to the `lights[i].groups` string send the following url request (ag = add group):

`<ip>:<port>/data?a=ag&i=<id>&n=<name>`

- i:= id oft the light you want to add the group to
- n := the name of the group you want 



## Switch light

Switching a remote plug works with a requests to a data path aswell.

``<ip>:<port>/data?a=cv&i=<id>&c=<code>&v=<value>``

Here the action (cv) stands for change value.



###### Legacy

Turning a specific remote plug on and off works as simple as the other commands:

`` <ip>:<port>/index.html?i=<id>&v=<value>&c=<code>``

