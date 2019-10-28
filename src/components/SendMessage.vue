<template>
  <div class="row">
    <b>SEND MESSAGE:</b>
    <br />
    <select v-model="fromAdr">
      <option
        v-for="identity in identities"
        v-bind:key="identity.address"
        v-bind:value="identity.address"
      >{{identity.address}}</option>
    </select>
    <input v-model="message" placeholder="message" />
    <input v-model="toAdr" placeholder="toAdr" />
    <button v-on:click="sendMessage">send</button>

    <br />
    <br />faucet adr: 9ecjMNCFDSbLZxVpfbFwFTLWuL7SH3Q49uzGrpK3bUcze6CJtDr
    <br />
    <br />
  </div>
</template> 

<script>
import { RadixAccount, RadixTransactionBuilder } from "radixdlt";

import moment from "moment";
import { Decimal } from "decimal.js";

export default {
  name: "SendMessage",
  props: {
    identities: Array
  },
  data() {
    return {
      toAdr: null,
      fromAdr: null,
      message: null
    };
  },
  methods: {
    sendMessage() {
      const fromIdentity = this._getIdentity(this.fromAdr);
      const toAccount = RadixAccount.fromAddress(this.toAdr, true);

      const transactionStatus = RadixTransactionBuilder.createRadixMessageAtom(
        fromIdentity["account"],
        toAccount,
        this.message
      ).signAndSubmit(fromIdentity["identity"]);

      transactionStatus.subscribe({
        next: status => {
          console.log(status);
          // For a valid transaction, this will print, 'FINDING_NODE', 'GENERATING_POW', 'SIGNING', 'STORE', 'STORED'
        },
        complete: () => {
          console.log("Transaction complete");
        },
        error: error => {
          console.error("Error submitting transaction", error);
        }
      });
    },
    _getIdentity(adr) {
      let ident = null;
      this.identities.map(identity => {
        if (identity.address == adr) {
          ident = identity;
        }
      });
      return ident;
    }
  },
  computed: {
    currentIdentity() {
      if (this.fromAdr) {
        return this._getIdentity(this.fromAdr);
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
