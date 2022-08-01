/*
 * Copyright (c) 2020-2022 in alphabetical order:
 * Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 *
 *  License-Identifier: EUPL-1.2
 *
 *  Contributors:
 *    George Benos (Telesto Technologies)
 *
 */

import { MongoDatastore } from "../../datastores/mongoDatastore"
import dotenv from "dotenv"
import assert from 'assert'
import {ProviderService} from "../../services/providerService"
import {RatingService} from "../../services/ratingService"

dotenv.config()

describe("providerService test suite", () => {

    const PROVIDER_1 = {
        did:"0x1234567890",
        name:"Prov Ider",
        email: "provider@email.com"
    }

    const PROVIDER_TEMP = {
        did:"0xtemp",
        name:"Prov Ider",
        email: "provider@email.com"
    }

    const CONSUMER_1 ={
        did:"0x0987654321",
        name:"Summer Conne",
        email: "consumer@email.com"
    }

    const CONSUMER_2 = {
        did:"0x9876556789",
        name:"Summer Conne the second",
        email: "consumer@email.com"
    }

    const RATINGS = [
        {byConsumer:CONSUMER_1.did, forProvider:PROVIDER_1.did, onTransaction:"trans1", subRatings: [5,5,5,5], msg:"it just works"},
        {byConsumer:CONSUMER_2.did, forProvider:PROVIDER_1.did, onTransaction:"trans2", subRatings: [4,4,4,4], msg:"it still just works"},
        {byConsumer:CONSUMER_1.did, forProvider:PROVIDER_1.did, onTransaction:"trans3", subRatings: [5,5,5,4], msg:"still going on"},
        {byConsumer:CONSUMER_2.did, forProvider:PROVIDER_1.did, onTransaction:"trans4", subRatings: [1,2,1,0], msg:"not good"},
    ]

    let ratingService
    let providerService
    let db

    /**
     * Reset DB before start testing
     */
    before(async () => {
        db = new MongoDatastore(process.env.MONGO_URL, {
            useNewUrlParser: true,
            userFindAndModify: false,
            useUnifiedTopology: true
        })

        await new Promise(r => setTimeout(r, 1000));
        ratingService = RatingService.init(db)
        providerService = ProviderService.init(db)
    })

    it("Should create a new provider in the datastore",
        async() =>{
            const prov = await providerService.createProvider(PROVIDER_TEMP)
            assert(prov.id, "Did not create new provider")
        }
    );

    it("Should delete a provider from the datastore",
        async() =>{
            await providerService.deleteProvider(PROVIDER_TEMP.did)
            const prov = await providerService.getProvider(PROVIDER_TEMP.did)
            assert(!prov, "Did not create new provider")
        }
    );


    it("should calculate the average rating of a provider based on all their ratings",
        async () => {
            for (let i=0; i<RATINGS.length; i++){
                await ratingService.createRating(RATINGS[i])
            }
            const rating = await providerService.getProviderRating(PROVIDER_1.did)
            assert.equal(rating, 3.9,"Did not calculate provider's rating properly")
        }
    );

    it("should forward a read request to the datastore and return the proper results",
        async ()=>{
            const provider = await providerService.getProvider(PROVIDER_1.did)
            assert.equal(provider.did, PROVIDER_1.did, "ProviderService did not retrieve provider properly")
        }
    );

    it("should respond to a rating and return proper results",
        async ()=>{
            const ratings = await ratingService.getAllRatings()
            await ratingService.respondToRating(ratings[0].id, "Yes it does")
            const rating = await ratingService.getRating(ratings[0].id)
            assert.equal(rating.response, "Yes it does", "ProviderService could not update rating properly")
        }
    );
})