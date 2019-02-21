const { ipcRenderer } = require('electron')

let $ = require('jquery')
let fs = require('fs')
var contacts = [];
let modal;
let vCard = require('vcf');

$('#cancelbtn').on('click', () => {
  ipcRenderer.send('asynchronous-message', 'closeModal')
})

$('#addbtn').on('click', () => {

  //GETTING INFO FROM FORMS INPUT FIELD
  let name = $('#contactname').val()
  let number = $('#contactnumber').val()
  let company = $('#contactcompany').val()
  let address = $('#contactaddress').val()
  let email = $('#contactemail').val()
  let url = $('#contacturl').val()
  let birthday = $('#contactbirthday').val()

  //WRITING THE INFO ABOVE TO TEXT FILE
  fs.appendFileSync('contacts.txt', name+","+number+ "," + company + "," + address + "," + email + "," + birthday + "," + url+'\n', (err) => {
    if (err) throw err;
    console.log("the data was appended!");
  });

  ipcRenderer.send('asynchronous-message', 'closeAndRefresh')

})

function addEntry(name, number){
  //CREATRING DICTIONARY
  var contact = {};
  contact['name'] = name;
  contact['number'] = number;
  // contact['company'] = company;
  // contact['address'] = address;
  // contact['email'] = email;
  // contact['url'] = url;
  // contact['birthday'] = birthday;
  contacts.push(contact);
  var index = contacts.length-1;

  let updateString = "<tr onclick='loadDetails(" + index + ")'><td>" + name + "</td><td>" + number + "</td></tr>"
  //<td>" + company + "</td><td>" + address + "</td><td>" + email + "</td><td>" + birthday + "</td><td>" + url + "</td></tr>"

  $('#contactlist').append(updateString)
}

function loadDetails(index){
    var contact = contacts[index];
    $('#selectedname').text(contact.name);
    $('#selectednumber').text(contact.number);
    $('#selectedcompany').text(contact.company);
    $('#selectedaddress').text(contact.address);
    $('#selectedemail').text(contact.email);
    $('#selectedurl').text(contact.url);
    $('#selectedbirthday').text(contact.birthday);
    $('#deletebtn').off('click');
    $('#deletebtn').on('click', () => {
      deleteEntry(index);
    })
}

function deleteEntry(index){

    contacts.splice(index, 1);
    fs.truncateSync('contacts.txt');

    contacts.forEach((contact, index) => {

      fs.appendFileSync('contacts.txt', contact.name+","+contact.number+'\n', (err) => {
        if (err) throw err;
        console.log("the data was appended!");
      });
    })

    contacts = [];
    loadAndDisplayContacts();
}

function loadAndDisplayContacts() {
   let filename = "contacts.txt";

   //Check if file exists
   if(fs.existsSync(filename)) {
      let data = fs.readFileSync(filename, 'utf8').split('\n')
      $('#contactlist').html("<tr><th>Name</th><th>Phone</th></tr>");
      data.forEach((contact, index) => {
         let [ name, number ] = contact.split(',')
         if (name && number){
           addEntry(name, number)
         }
      })
      if (contacts.length > 0){
        loadDetails(0);
      }
   }
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
