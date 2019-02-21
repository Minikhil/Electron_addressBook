const { ipcRenderer } = require('electron')

let $ = require('jquery')
let fs = require('fs')
var contacts = [];
let modal;
let vCard = require('vcf');

$('#cancelbtn').on('click', () => {
  ipcRenderer.send('asynchronous-message', 'closeModal')
})

//Upon clicking add we write the data from form into contacts.txt file
// $('#addbtn').on('click', () => {
//
//   //GETTING INFO FROM FORMS INPUT FIELD
//   let name = $("input[name=contactname]").val()
//   let number = $('#contactnumber').val()
//   let company = $("input[name=contactcompany]").val()
//   let address = $('#contactaddress').val()
//   let email = $('#contactemail').val()
//   let url = $('#contacturl').val()
//   let birthday = $('#contactbirthday').val()
//
//   //WRITING THE INFO ABOVE TO TEXT FILE
//   fs.appendFileSync('contacts.txt', name+","+number+ "," + company + "," + address + "," + email + "," + birthday + "," + url+'\n', (err) => {
//     if (err) throw err;
//     console.log("the data was appended!");
//   });
//
//   ipcRenderer.send('asynchronous-message', 'closeAndRefresh')
//
// })

function addbtnHandeler(){
  let name = document.getElementById("contactname").value;
  let number = document.getElementById("contactnumber").value;
  let company = document.getElementById("contactcompany").value;
  let address = document.getElementById("contactaddress").value;
  let email = document.getElementById("contactemail").value;
  let url = document.getElementById("contacturl").value;
  let birthday = document.getElementById("contactbirthday").value;

  //WRITING THE INFO ABOVE TO TEXT FILE
  fs.appendFileSync('contacts.txt', name+","+number+ "," + company + "," + address + "," + email + "," + birthday + "," + url+'\n', (err) => {
    if (err) throw err;
    console.log("the data was appended!");
  });

  ipcRenderer.send('asynchronous-message', 'closeAndRefresh')
}




//Need to pass in the data var as parameters and storing data in obj to be accessed
//Gets called by loadAndDisplayContacts()
function addEntry(name, number, company){
  //CREATRING OBJ
  //* conatct {
  //            name: Nikhil
  //            number: 646
  //            ...
//            }
  var contact = {};
  contact['name'] = name;
  contact['number'] = number;
  contact['company'] = company;
  // contact['address'] = address;
  // contact['email'] = email;
  // contact['url'] = url;
  // contact['birthday'] = birthday;
  contacts.push(contact);
  var index = contacts.length-1;

  let updateString = "<tr onclick='loadDetails(" + index + ")'><td>" + name + "</td><td>" + number + "</td><td>" + company + "</td></tr>"

  //HTML code gets appended to left panel, adding rows to contact list <tr>
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
      $('#contactlist').html("<tr><th>Name</th><th>Phone</th><th>Company</th></tr>");
      data.forEach((contact, index) => {
         let [ name, number, company ] = contact.split(',')
         //if (name && number){
           addEntry(name, number, company)
         //}
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
