<template>
  <div class="hello">
    <h1>{{ msg }}</h1>

    <button v-on:click="createOne">create one</button>
    <button v-on:click="createSmiley">create smiley</button>
    <button v-on:click="createAllBlack">create everything</button>
    <button v-on:click="createRadix">create Radix</button>
    <button v-on:click="createRadixIdentity">create Your Identity</button>
    <button v-on:click="createFriendIdentity">create Friend Identity</button>
    <button v-on:click="sendAtom(1,'white')">Send atom</button>
    <button v-on:click="getMoneyFromFaucet">getMoneyFromFaucet</button>

    <div class="canvas">
      <div v-for="item in boardArray" v-bind:key="item.id">
        <div v-if="item.color == true" class="pixelLight"></div>
        <div v-else class="pixelDark"></div>
      </div>
    </div>

    <!-- end .canvas -->
  </div>
</template> 

<script>
import {
  radixUniverse,
  RadixUniverse,
  radixTokenManager,
  RadixKeyStore,
  RadixSimpleIdentity,
  RadixIdentityManager,
  RadixAccount,
  RadixTransactionBuilder
} from "radixdlt";

export default {
  name: "HelloWorld",
  props: {
    msg: String
  },
  components: {},
  data() {
    return {
      boardArray: [],
      boardSize: 256,
      myIdentity: null,
      myAccount: null,
      friendAccount: null,
      iter: 0,
      counter: []
    };
  },
  methods: {
    genBoard() {
      for (let index = 0; index < this.boardSize; index++) {
        this.boardArray.push({ id: index, color: false });
      }
    },
    createOne() {
      const blackArray = [135];
      this._updateBoard(blackArray);
    },
    createSmiley() {
      const blackArray = [101, 105, 135, 148, 154, 165, 169, 182, 183, 184];
      this._updateBoard(blackArray);
    },
    createAllBlack() {
      const blackArray = Array.from(Array(this.boardSize), (x, index) => index);
      this._updateBoard(blackArray);
    },
    _updateBoard(blackArray) {
      const whiteArray = Array.from(Array(this.boardSize), (x, index) => index);

      whiteArray.map(function(coord) {
        this.boardArray[coord]["color"] = false;
      }, this);

      blackArray.map(function(coord) {
        this.boardArray[coord]["color"] = true;
      }, this);
    },
    loadIdentity() {
      return new Promise((resolve, reject) => {
        // NOTE: This is insecure, normally you would ask the user for a password
        const password = "SuperDuperSecretPassword";
        const identityManager = new RadixIdentityManager();

        if (!localStorage.keystore) {
          // Generate a new random identity
          const identity = identityManager.generateSimpleIdentity();
          RadixKeyStore.encryptKey(identity.address, password)
            .then(encryptedKey => {
              localStorage.keystore = JSON.stringify(encryptedKey);
              console.log("Encrypted private key stored in localstorage");
            })
            .catch(error => {
              console.error("Error encrypting private key", error);
            });
          resolve(identity);
        } else {
          // Load identity from localstorage
          const encryptedKey = JSON.parse(localStorage.keystore);
          RadixKeyStore.decryptKey(encryptedKey, password)
            .then(address => {
              console.log("Private key successfuly decrypted");
              const identity = new RadixSimpleIdentity(address);
              return resolve(identity);
            })
            .catch(error => {
              console.error("Error decrypting private key", error);
            });
        }
      });
    },
    createRadix() {
      // Bootstrap the universe
      //   const radixUniverse = require("radixdlt").radixUniverse;
      const LOCALHOST_SINGLENODE = RadixUniverse.LOCALHOST_SINGLENODE;

      radixUniverse.bootstrap(LOCALHOST_SINGLENODE);
    },
    createRadixIdentity() {
      this.loadIdentity().then(identity => {
        this.myIdentity = identity;
        this.myAccount = identity.account;
        this.myAccount.openNodeConnection();
        console.log("My account address: ", identity.account.getAddress());
      });
    },
    createFriendIdentity() {
      // const identityManager = new RadixIdentityManager();
      // const identity = identityManager.generateSimpleIdentity();
      // console.log(identity.account.getAddress())

        // first: crypted messages
      // JHWiQH3hDoKi31WxJZfp8S5js8P9hvo6BiHk3pGu4xQEHYtWN6J 
    //   second: 1000 messages
    //   JEJYbgTugtzGe8f6jsVbSGm76wYsPvYDBkNtd9wzd49jv84khtV

      var currentdate = new Date();
          var datetime =
            "" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
          
            console.log("start: ", datetime);

      this.friendAccount = RadixAccount.fromAddress(
        "JEJYbgTugtzGe8f6jsVbSGm76wYsPvYDBkNtd9wzd49jv84khtV"
      );
      this.friendAccount.openNodeConnection();
      console.log(this.friendAccount.getAddress());

      this.friendAccount.dataSystem
        .getApplicationData("my-test-app")
        .subscribe(data => {
          var currentdate = new Date();
          var datetime =
            "" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
          if (this.counter.length == 0) {
            console.log("0: ", datetime);
          } else if (this.counter.length == 10) {
            console.log("10: ", datetime);
          } else if (this.counter.length == 100) {
            console.log("100: ", datetime);
          } else if (this.counter.length == 500) {
            console.log("500: ", datetime);
          } else if (this.counter.length == 1000) {
            console.log("1000: ", datetime);
          }

          this.counter.push(JSON.parse(data.data.payload.data));

          // this.sendAtom(this.iter, "black");
        });
    },
    sendAtom(coord, color) {
      const applicationId = "my-test-app";

      this.iter = this.iter + 1;

      const payload = JSON.stringify({
        color: color,
        coord: this.iter
      });

      const transactionStatus = RadixTransactionBuilder.createPayloadAtom(
        this.myAccount,
        [this.friendAccount],
        applicationId,
        payload,
        false
      ).signAndSubmit(this.myIdentity);

      transactionStatus.subscribe({
        next: status => {
          console.log(status);
          // For a valid transaction, this will print, 'FINDING_NOD   E', 'GENERATING_POW', 'SIGNING', 'STORE', 'STORED'
        },
        complete: () => {
          console.log("Transaction complete");
        },
        error: error => {
          console.error("Error submitting transaction", error);
        }
      });
    },
    getMoneyFromFaucet() {
      const faucetAddress =
        "JH1P8f3znbyrDj8F4RWpix7hRkgxqHjdW2fNnKpR3v6ufXnknor";
      const faucetAccount = RadixAccount.fromAddress(faucetAddress, true);
      const message = "Dear Faucet, may I please have some money?";

      RadixTransactionBuilder.createRadixMessageAtom(
        this.myAccount,
        faucetAccount,
        message
      ).signAndSubmit(this.myIdentity);

      const radixToken = radixUniverse.nativeToken;
      this.myAccount.transferSystem
        .getTokenUnitsBalanceUpdates()
        .subscribe(balance => {
          // Get the balance for the token we are interested in
          const nativeTokenBalance = balance[radixToken.toString()];
          console.log("balance is: " + nativeTokenBalance + " XRD");
        });
    }
  },
  created() {
    this.genBoard();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.canvas {
  /* Perfectly square */
  width: 240px;
  height: 240px;
}

.pixelLight {
  /* We'll need 64 total pixels in our HTML */
  width: 15px;
  height: 15px;
  float: left;
  box-shadow: 0px 0px 1px #42b983;
  background-color: rgb(255, 230, 0);
}

.pixelDark {
  /* We'll need 64 total pixels in our HTML */
  width: 15px;
  height: 15px;
  float: left;
  box-shadow: 0px 0px 1px #42b983;
  background-color: #000;
}
</style>
