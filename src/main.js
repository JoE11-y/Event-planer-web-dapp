import Web3 from 'web3'
import { newKitFromWeb3 } from '@celo/contractkit'
import BigNumber from "bignumber.js"
import eventplannerAbi from '../contract/eventplanner.abi.json'
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const EVContractAddress = "0xDAF35e7285dE30f0d81c55AbAde8fC64EdAea251"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let events = {}
let contract
let kit
let isDonationMsgActive

/// Blockchain functions

const connectCeloWallet = async function () {
  if (window.celo) {
      notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()
  
      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)
  
      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(eventplannerAbi, EVContractAddress)

  
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
  }
  
  const getBalance = async function (){
  notification("⌛ Loading...")
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  editBalance(cUSDBalance)
  }
  
const getEvent = async function(_ID) {
  notification("⌛ Loading...")
  const _details = []
  let _eventinfo = new Promise(async (resolve, reject) => {
    let p = await contract.methods.getEventinfo(_ID).call()
    resolve({
      eventID: _ID,
      owner: p[0],
      eventTitle: p[1],
      organizers: p[2],
      image: p[3],
      eventType: p[4],
      eventDescription: p[5],
      attendees: p[6],
    })
  })
  let _eventVenueinfo = new Promise(async (resolve, reject) => {
    let p = await contract.methods.getLocation(_ID).call()
    resolve({
      locationtype: p[0],
      address: p[1],
      city: p[2],
      region: p[3],
      postalCode: p[4],
      country: p[5],
    })
  })
  let _eventLinkinfo = new Promise(async (resolve, reject) => {
    let p = await contract.methods.getLinks(_ID).call()
    resolve({
      youtube: p[0],
      facebook: p[1],
      googleMeet: p[2],
      skype: p[3],
      others: p[4],
    })
  })
  let _eventDateinfo = new Promise(async (resolve, reject) => {
    let p = await contract.methods.getDatesnTime(_ID).call()
    resolve({
      eventStart: p[0],
      eventEnds: p[1],
      startTime: p[2],
      endTime: p[3],
      timeZone: p[4],
    })
  })
  for (let promise of [_eventinfo, _eventVenueinfo, _eventLinkinfo, _eventDateinfo]) {
    try {
      const details = await promise
      events = {...events, ...details}
    }
    catch (err) {
      notification(`⚠️ ${err}.`)
    }
  }

  events["isEventActive"] = await contract.methods.checkEventStatus(_ID).call()
  isDonationMsgActive = await contract.methods.checkForDonations(_ID).call()

  if (isDonationMsgActive == true){
    events["donationMessage"] = await contract.methods.getDonationMsg(_ID).call()
    events["totalDonations"] = await contract.methods.showTotalDonations(_ID).call()
  }
  else {
    events["donationMessage"] = ""
    events["totalDonations"] = ""
  }

  renderEvent()
}


async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(EVContractAddress, _price)
    .send({ from: kit.defaultAccount })
  return result
}






/// Created functions
function eventTemplate(_event){
  let locationDetail1 
  let locationDetail2
  let locationDetail3
  let locationDetail4
  let locationDetail5
    if (_event.locationtype == "Online Event"){
        locationDetail1=_event.youtube;
        locationDetail2=_event.zoom;
        locationDetail3=_event.googleMeet;
        locationDetail4=_event.skype;
        locationDetail5=_event.others; 
    }
    else{
        locationDetail1=_event.address;
        locationDetail2=_event.city;
        locationDetail3=_event.region;
        locationDetail4=_event.postalCode;
        locationDetail5=_event.country; 
    }
    return`
    <div class="modal-content">
    <div class="modal-header">
        <h6 class="modal-title" id="eventModals" style="padding-right: 5px;">Event ID:</h6><span>#${_event.eventID}</span>
        <button
        type="button"
        class="btn-close"
        data-bs-dismiss="modal"
        aria-label="Close"
        ></button>
    </div>
    <div class="modal-body">
      <div class="card mb-4">
        <img class="card-img-top" src="" alt="...">
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start" id="attendees" >
        <i class="bi bi-people-fill"></i>${_event.attendees}
        </div>
        <div class="card-body text-left p-4 position-relative">
          <div class="translate-middle-y position-absolute top-0" id="identicon"> 
          ${identiconTemplate(_event.owner)}
          </div>
          <h2 class="card-title fs-4 fw-bold mt-2">${_event.eventTitle}</h2>
          
          <p class="card-text mb-4" style="min-height: 82px">
          ${_event.eventDescription}       
          </p>  
          <p class="card-text" style="min-height: 82px" id="Venues">
            <span><h4>${_event.locationtype}</h4></span>
            <i class="bi bi-geo-alt-fill"></i>
            ${locationDetail1}<br>
            ${locationDetail2}<br>
            ${locationDetail3}<br>
            ${locationDetail5}<br>
          </p>
          <p class="card-text" id="Date">
            <i class="bi bi-calendar4-week"></i>
            ${_event.eventStart} to ${_event.eventEnds}
          </p>
          <p class="card-text" id="Time">
            <i class="bi bi-clock-fill"></i>
            ${_event.startTime} - ${_event.endTime} ${_event.timeZone}
          </p>
        </div>
      </div>      
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-lg btn-block" data-bs-dismiss="modal" id="joinEventButton">Join Event</button>
    </div>
    </div>
    `
}

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()
    return `
    <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
      <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
          target="_blank">
          <img src="${icon}" width="48" alt="${_address}">
      </a>
    </div>
    `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

function renderEvent() {
  document.getElementById("eventDisplay").innerHTML = ""
  const newDiv = document.createElement("div")
  newDiv.className = "modal-content"
  newDiv.innerHTML = eventTemplate(events)
  document.getElementById("eventDisplay").appendChild(newDiv)
  $("#eventDetailModal").modal('show');
  notificationOff()
}

function editAddress(_address){

  let address = document.querySelector(".addr")
  let add = _address
  add = add+'.'
  let str1 = add.slice(0,6);
  let str2 = add.slice(-5, -1);
  address.textContent = str1+'...'+str2
  address.style.display = 'flex'
  document.getElementById("blockchainlink").href=`https://alfajores-blockscout.celo-testnet.org/address/${kit.defaultAccount}/transactions`
}

function editBalance(_bal){
  let _balance = document.querySelector(".bal")
  let balance = document.querySelector("#balance")
  balance.textContent = _bal
  _balance.style.display = "flex"
}







/// Document Queries
document.querySelector("#newEventBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("newEventTitle").value,
    document.getElementById("newEventID").value,
    document.getElementById("eventOrganizer").value,
    document.getElementById("newImgUrl").value,
    document.getElementById("newEventType").value,
    document.getElementById("newEventDescription").value,
    document.getElementById("newEventLocationType").value,
    [
      document.getElementById("newEventAddress").value,
      document.getElementById("newEventCity").value,
      document.getElementById("newEventRegion").value,
      document.getElementById("newEventPostalCode").value,
      document.getElementById("newEventCountry").value
    ],
    [
      document.getElementById("facebook").value,
      document.getElementById("skype").value,
      document.getElementById("youtube").value,
      document.getElementById("googleMeet").value,
      document.getElementById("others").value
    ],
    [
      document.getElementById("newEventStartDate").value,
      document.getElementById("newEventEndDate").value,
      document.getElementById("newEventStartTime").value,
      document.getElementById("newEventEndTime").value,
      document.getElementById("newEventTimezone").value
    ]
  ]

  notification(`⌛ Adding "${params[0]}"...`)  

  try {
    const result = await contract.methods
      .writeEvent(...params)
      .send({ from: kit.defaultAccount })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }

  if (isDonationMsgActive == true){
    try { 
      const _donationMsg = [document.getElementById("newEventID").value,
       document.getElementById("donationMessage").value]
      const dMsg = await contract.methods
      .writeDonationMsg(..._donationMsg)
      .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  notification(`🎉 You successfully added "${params[0]}".`)
})

$(document).ready(()=>{
  $('.js-revealer').on('change', function(){
    var $select = $(this);
    var $selected = $select.find('option:selected');
    var hideSelector = $selected.data('r-hide-target');
    var showSelector = $selected.data('r-show-target');
        
    $(hideSelector).addClass('is-hidden');
    $(showSelector).removeClass('is-hidden');
  });

  $('input[type="checkbox"]').click(function(){
    var selected = $(this).data('r-show-target')
    if($(this).is(":checked")){
      $(selected).removeClass('is-hidden')
    }
    else if($(this).is(":not(:checked)")){
      $(selected).addClass('is-hidden')
    }
  });

  $("#donationBox").click(function() {
    if ($("input[type=checkbox]").is(
      ":checked")) {
        isDonationMsgActive = true
    } else {
        isDonationMsgActive = false
    }
    alert(isDonationMsg)
  });

});

document.querySelector("#connectAccount").addEventListener("click",  async (e) => {
  await connectCeloWallet()
  document.querySelector("#connectAccount").style.display = "none"
  await getBalance()
  editAddress(kit.defaultAccount)
  notificationOff()
})

document.querySelector("#findEventBtn").addEventListener("click",  async (e) => {
  let _eID = document.getElementById("eventID").value
  getEvent(_eID)
})






