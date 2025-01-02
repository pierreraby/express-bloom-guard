// ClaimsManager.js

export class ClaimsManager {
  constructor() {
    this.claims = ['jti', 'fam', 'sub', 'admin']; // Default claims
  }

  /**
   * Adds a new claim with its Bloom Filter configuration.
   * @param {string} claim - The name of the claim.
   */
  addClaim(claim) {
    if (this.claims[claim]) {
      throw new Error(`The claim "${claim}" already exists.`);
    }
    this.claims.push(claim)
    console.log(`Claim "${claim}" added`);
  }

  /**
   * Removes a claim and its associated Bloom Filter.
   * @param {string} claim - The name of the claim to remove.
   */
  removeClaim(claim) {
    if (!this.claims[claim]) {
      throw new Error(`The claim "${claim}" does not exist.`);
    }
    // Remove the claim from the list
    this.claims = this.claims.filter(c => c !== claim);
    console.log(`Claim "${claim}" removed.`);
  }

  /**
   * Resets all claim to check.
   */
  resetClaim() {
    if (!this.claims[claim]) {
      throw new Error(`The claim "${claim}" does not exist.`);
    }
    // Remove all claims
    this.claims = [];
    console.log(`Claim "${claim}" cleared.`);
  }

  /**
   * Lists all configured claims.
   * @returns {Array<string>}
   */
  listClaims() {
    return this.claims;
  }
}
