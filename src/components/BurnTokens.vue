<template>
  <div class="row">
    <b>BURN TOKEN:</b>
    <br />
    <select v-model="fromAdr">
      <option
        v-for="identity in identities"
        v-bind:key="identity.address"
        v-bind:value="identity.address"
      >{{identity.address}}</option>
    </select>
    <select v-if="fromAdr" v-model="token">
      <option
        v-for="token in currentIdentity.allTokens"
        v-bind:key="token"
        v-bind:value="token"
      >{{_getSymbolfromKey(token)}}</option>
    </select>
    <input v-model="amount" placeholder="amount" />
    <button v-on:click="burnToken(fromAdr,amount,token)">BURN</button>

    <br />
  </div>
</template> 

<script>
import { RadixAccount, RadixTransactionBuilder } from "radixdlt";

import moment from "moment";
import { Decimal } from "decimal.js";

export default {
  name: "BurnTokens",
  props: {
    identities: Array
  },
  data() {
    return {
      amount: null,
      token: null,
      fromAdr: null
    };
  },
  methods: {
    burnToken(fromAdr, amount_input, token) {
      const fromIdentity = this._getIdentity(fromAdr);
      const balance = new Decimal(
        fromIdentity["balances"][this._getSymbolfromKey(token)]
      );
      const amount = new Decimal(amount_input);

      if (!amount.greaterThan(balance)) {
        RadixTransactionBuilder.createBurnAtom(
          fromIdentity["account"],
          token,
          amount
        )
          .signAndSubmit(fromIdentity["identity"])
          .subscribe({
            next: status => {
              console.log(status);
            },
            complete: () => {
              console.log("Tokens have been burned");
            },
            error: error => {
              console.error("Error submitting transaction", error);
            }
          });
      } else {
        console.log("insufficient funds");
      }
    },
    _getSymbolfromKey(key) {
      return key.split("/")[2].toString();
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
