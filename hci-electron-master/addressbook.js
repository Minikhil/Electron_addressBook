const { ipcRenderer } = require('electron')


let $ = require('jquery')
//Filesystem module
let fs = require('fs')

//Dialogs module
// const{dialog} = require("electron").remote;
var contacts = [];
var images =[];
let modal;
let vCard = require('vcf');

$('#cancelbtn').on('click', () => {
  ipcRenderer.send('asynchronous-message', 'closeModal')
})

const addbtn = document.getElementById('addbtn');
const contactemail = document.getElementById('contactemail');
const urlTag = document.getElementById('selectedurl');


function addbtnHandeler(){
  let name = document.getElementById("contactname").value;
  let number = document.getElementById("contactnumber").value;
  let cellNumber = document.getElementById("contactcellnumber").value;
  let company = document.getElementById("contactcompany").value;
  let address = document.getElementById("contactaddress").value;
  let email = document.getElementById("contactemail").value;
  let url = document.getElementById("contacturl").value;
  let birthday = document.getElementById("contactbirthday").value;

  //WRITING THE INFO ABOVE TO TEXT FILE
  fs.appendFileSync('contacts.txt', name+"|"+number+ "|" + cellNumber+ "|" + company + "|" + address + "|" + email + "|" + birthday + "|" + url+'\n', (err) => {
    if (err) throw err;
    console.log("the data was appended!");
  });

  ipcRenderer.send('asynchronous-message', 'closeAndRefresh')
}




//Need to pass in the data var as parameters and storing data in obj to be accessed
//Gets called by loadAndDisplayContacts()
function addEntry(name, number, cellNumber, company, address, email, birthday, url){
  //CREATRING OBJ
  //* conatct {
  //            name: Nikhil
  //            number: 646
  //            ...
//            }
  var contact = {};
  contact['name'] = name;
  contact['number'] = number;
  contact['cellNumber'] = cellNumber;
  contact['company'] = company;
  contact['address'] = address;
  contact['email'] = email;
  contact['url'] = url;
  contact['birthday'] = birthday;
  contacts.push(contact);
  var index = contacts.length-1;

  let updateString = "<tr onclick='loadDetails(" + index + ")'><td>" + name + "</td></tr>"

  //HTML code gets appended to left panel, adding rows to contact list <tr>
  $('#contactlist').append(updateString)
}

function loadDetails(index){
    var contact = contacts[index];
    $('#selectedname').text(contact.name);
    $('#selectednumber').text(contact.number);
    $('#selectedcellNumber').text(contact.cellNumber);
    $('#selectedcompany').text(contact.company);
    $('#selecteaddress').text(contact.address);
    $('#selectedemail').text(contact.email);
    $('#selectedurl').text(contact.url);
    $('#selectedurl').attr("href", contact.url);
    $('#selectedbirthday').text(contact.birthday);

    $('#deletebtn').off('click');
    $('#deletebtn').on('click', () => {
      deleteEntry(index);
    })
}

function deleteEntry(index){

    //Deleteting from contacts array starting at index and deleting 1 item
    contacts.splice(index, 1);

    //
    fs.truncateSync('contacts.txt');

    contacts.forEach((contact, index) => {

      fs.appendFileSync('contacts.txt',contact.name+"|"+contact.number+ "|" + contact.cellNumber+ "|" + contact.company + "|" + contact.address + "|" + contact.email + "|" + contact.birthday + "|" + contact.url+'\n', (err) => {
        if (err) throw err;
        console.log("the data was appended!");
      });
    })

    contacts = [];
    loadAndDisplayContacts();
}

//READS FROM TXT AND CALLS addEntry()
function loadAndDisplayContacts() {
   let filename = "contacts.txt";

   //Check if file exists
   if(fs.existsSync(filename)) {
     //splitting at each line
      let data = fs.readFileSync(filename, 'utf8').split('\n')
      $('#contactlist').html("<tr></tr>");
      data.forEach((contact, index) => {
         let [ name, number, cellNumber, company, address, email, birthday, url ] = contact.split('|')

         //WILL ONLY ADD IF THE DATA FIELDS IN IF CONDITION FILLEED OUT
         if (name && number){
           addEntry(name, number, cellNumber, company, address, email, birthday, url)
         }
      })
      if (contacts.length > 0){
        loadDetails(0);
      }
   }
}


if (window.File && window.FileReader && window.FileList && window.Blob) {
// render the image in our view
function renderImage(file) {
  images.push(file);
// generate a new FileReader object
  var reader = new FileReader();
// inject an image with the src url
  reader.onload = function(event) {
    the_url = event.target.result
    $('#preview').html("<img src='" + the_url + "' />")
}// when the file is read it triggers the onload event above.
  reader.readAsDataURL(file);
}

// handle input changes
$("#the-file-input").change(function() {
    console.log(this.files)
    alert("file uploades!")

    // grab the first image in the FileList object and pass it to the function
    renderImage(this.files[0])

});
}
else{
  alert('The File APIs are not fully supported in this browser.');
}


function showAddContactModal(){
  ipcRenderer.send('asynchronous-message', 'showModal')
}

function importFile(filename){
    let data = fs.readFileSync(filename, 'utf8');
    var cards = vCard.parse(data);
    cards.forEach((card, index) => {
      fs.appendFileSync('contacts.txt', card.get("n")+","+card.get("tel")+'\n', (err) => {
        if (err) throw err;
        console.log("the data was appended!");
      });

    });
    contacts = [];
    loadAndDisplayContacts();
}

function exportFile(){
    contacts.forEach((contact, index) => {
    console.log('exporting contact '+contact.name);
    card = new vCard();
    card.set("n", contact.name);
    card.set("tel", contact.number);
    fs.appendFileSync("vcard.txt", card.toString(),(err) => {
      if (err) throw err;
      console.log("the data was exported!");
    });

  })
}
