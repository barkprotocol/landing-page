app/api/v1/actions/tokens/[uniqueid]/route.ts:73:37 - error TS2339: Property 'InvalidCredentials' does not exist on type 'typeof ErrorType'.

73     throw new CustomError(ErrorType.InvalidCredentials, 'Invalid email or password')
                                       ~~~~~~~~~~~~~~~~~~

app/api/v1/actions/tokens/[uniqueid]/route.ts:84:37 - error TS2339: Property 'UserAlreadyExists' does not exist on type 'typeof ErrorType'.

84     throw new CustomError(ErrorType.UserAlreadyExists, 'User with this email already exists')
                                       ~~~~~~~~~~~~~~~~~

app/api/v1/actions/tokens/generate/route.ts:2:27 - error TS2307: Cannot find module '@/lib/mongodb' or its corresponding type declarations.

2 import clientPromise from '@/lib/mongodb';
                            ~~~~~~~~~~~~~~~

app/api/v1/users/route.ts:1:21 - error TS7016: Could not find a declaration file for module 'express'. '/workspaces/landing-page/node_modules/express/index.js' implicitly has an 'any' type.
  Try `npm i --save-dev @types/express` if it exists or add a new declaration (.d.ts) file containing `declare module 'express';`

1 import express from 'express';
                      ~~~~~~~~~

app/api/v1/users/route.ts:2:40 - error TS2307: Cannot find module 'express-validator' or its corresponding type declarations.

2 import { body, validationResult } from 'express-validator';
                                         ~~~~~~~~~~~~~~~~~~~

app/api/v1/users/route.ts:3:61 - error TS2307: Cannot find module './userController' or its corresponding type declarations.

3 import { createUser, getUser, updateUser, deleteUser } from './userController';
                                                              ~~~~~~~~~~~~~~~~~~

app/api/v1/users/route.ts:16:10 - error TS7006: Parameter 'req' implicitly has an 'any' type.

16   async (req, res) => {
            ~~~

app/api/v1/users/route.ts:16:15 - error TS7006: Parameter 'res' implicitly has an 'any' type.

16   async (req, res) => {
                 ~~~

app/api/v1/users/route.ts:35:27 - error TS7006: Parameter 'req' implicitly has an 'any' type.

35 router.get('/:id', async (req, res) => {
                             ~~~

app/api/v1/users/route.ts:35:32 - error TS7006: Parameter 'res' implicitly has an 'any' type.

35 router.get('/:id', async (req, res) => {
                                  ~~~

app/api/v1/users/route.ts:51:27 - error TS7006: Parameter 'req' implicitly has an 'any' type.

51 router.put('/:id', async (req, res) => {
                             ~~~

app/api/v1/users/route.ts:51:32 - error TS7006: Parameter 'res' implicitly has an 'any' type.

51 router.put('/:id', async (req, res) => {
                                  ~~~

app/api/v1/users/route.ts:67:30 - error TS7006: Parameter 'req' implicitly has an 'any' type.

67 router.delete('/:id', async (req, res) => {
                                ~~~

app/api/v1/users/route.ts:67:35 - error TS7006: Parameter 'res' implicitly has an 'any' type.

67 router.delete('/:id', async (req, res) => {
                                     ~~~

app/blinkboard/page.tsx:23:56 - error TS2307: Cannot find module '@/lib/solana-utils' or its corresponding type declarations.

23 import { fetchBalance, createBlink, fetchBlinks } from "@/lib/solana-utils"
                                                          ~~~~~~~~~~~~~~~~~~~~

app/blinks/page.tsx:127:68 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

127           transaction = await createPaymentTransaction(connection, publicKey, formData.payment)
                                                                       ~~~~~~~~~

app/blinks/page.tsx:130:65 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

130           transaction = await createGiftTransaction(connection, publicKey, formData.gift)
                                                                    ~~~~~~~~~

app/blinks/page.tsx:133:64 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

133           transaction = await createNFTTransaction(connection, publicKey, formData.nft)
                                                                   ~~~~~~~~~

app/blinks/page.tsx:136:69 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

136           transaction = await createDonationTransaction(connection, publicKey, formData.donation)
                                                                        ~~~~~~~~~

app/blinks/page.tsx:139:68 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

139           transaction = await createGeneralTransaction(connection, publicKey, formData.transaction)
                                                                       ~~~~~~~~~

app/blinks/page.tsx:142:65 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

142           transaction = await createMemoTransaction(connection, publicKey, formData.memo)
                                                                    ~~~~~~~~~

app/blinks/page.tsx:145:73 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

145           transaction = await createCrowdfundingTransaction(connection, publicKey, formData.crowdfunding)
                                                                            ~~~~~~~~~

app/blinks/page.tsx:148:73 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

148           transaction = await createSubscriptionTransaction(connection, publicKey, formData.subscription)
                                                                            ~~~~~~~~~

app/blinks/page.tsx:154:39 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

154       const signedTransaction = await signTransaction(transaction)
                                          ~~~~~~~~~~~~~~~

app/blinks/page.tsx:154:39 - error TS18048: 'signTransaction' is possibly 'undefined'.

154       const signedTransaction = await signTransaction(transaction)
                                          ~~~~~~~~~~~~~~~

app/blinks/page.tsx:349:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

349         return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
                        ~~~~

app/blinks/page.tsx:349:34 - error TS2339: Property 'amount' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'amount' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

349         return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
                                     ~~~~~~

app/blinks/page.tsx:349:49 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

349         return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
                                                    ~~~~~~~~

app/blinks/page.tsx:349:66 - error TS2339: Property 'recipient' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'recipient' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

349         return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
                                                                     ~~~~~~~~~

app/blinks/page.tsx:349:84 - error TS2339: Property 'paymentMethod' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'paymentMethod' does not exist on type '{ name: string; amount: string; currency: string; recipient: string; message: string; }'.

349         return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
                                                                                       ~~~~~~~~~~~~~

app/blinks/page.tsx:351:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

351         return data.name && data.amount && data.currency && data.recipient
                        ~~~~

app/blinks/page.tsx:351:34 - error TS2339: Property 'amount' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'amount' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

351         return data.name && data.amount && data.currency && data.recipient
                                     ~~~~~~

app/blinks/page.tsx:351:49 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

351         return data.name && data.amount && data.currency && data.recipient
                                                    ~~~~~~~~

app/blinks/page.tsx:351:66 - error TS2339: Property 'recipient' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'recipient' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

351         return data.name && data.amount && data.currency && data.recipient
                                                                     ~~~~~~~~~

app/blinks/page.tsx:353:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

353         return data.name && data.description && data.image
                        ~~~~

app/blinks/page.tsx:353:34 - error TS2339: Property 'description' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'description' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

353         return data.name && data.description && data.image
                                     ~~~~~~~~~~~

app/blinks/page.tsx:353:54 - error TS2339: Property 'image' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'image' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

353         return data.name && data.description && data.image
                                                         ~~~~~

app/blinks/page.tsx:355:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

355         return data.name && data.amount && data.currency && data.cause
                        ~~~~

app/blinks/page.tsx:355:34 - error TS2339: Property 'amount' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'amount' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

355         return data.name && data.amount && data.currency && data.cause
                                     ~~~~~~

app/blinks/page.tsx:355:49 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

355         return data.name && data.amount && data.currency && data.cause
                                                    ~~~~~~~~

app/blinks/page.tsx:355:66 - error TS2339: Property 'cause' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'cause' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

355         return data.name && data.amount && data.currency && data.cause
                                                                     ~~~~~

app/blinks/page.tsx:357:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

357         return data.name && data.amount && data.currency && data.recipient
                        ~~~~

app/blinks/page.tsx:357:34 - error TS2339: Property 'amount' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'amount' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

357         return data.name && data.amount && data.currency && data.recipient
                                     ~~~~~~

app/blinks/page.tsx:357:49 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

357         return data.name && data.amount && data.currency && data.recipient
                                                    ~~~~~~~~

app/blinks/page.tsx:357:66 - error TS2339: Property 'recipient' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'recipient' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

357         return data.name && data.amount && data.currency && data.recipient
                                                                     ~~~~~~~~~

app/blinks/page.tsx:359:21 - error TS2339: Property 'title' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'title' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

359         return data.title && data.content
                        ~~~~~

app/blinks/page.tsx:359:35 - error TS2339: Property 'content' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'content' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

359         return data.title && data.content
                                      ~~~~~~~

app/blinks/page.tsx:361:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

361         return data.name && data.goal && data.currency && data.description && data.category
                        ~~~~

app/blinks/page.tsx:361:34 - error TS2339: Property 'goal' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'goal' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

361         return data.name && data.goal && data.currency && data.description && data.category
                                     ~~~~

app/blinks/page.tsx:361:47 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

361         return data.name && data.goal && data.currency && data.description && data.category
                                                  ~~~~~~~~

app/blinks/page.tsx:361:64 - error TS2339: Property 'description' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'description' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

361         return data.name && data.goal && data.currency && data.description && data.category
                                                                   ~~~~~~~~~~~

app/blinks/page.tsx:361:84 - error TS2339: Property 'category' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'category' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

361         return data.name && data.goal && data.currency && data.description && data.category
                                                                                       ~~~~~~~~

app/blinks/page.tsx:363:21 - error TS2339: Property 'name' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'name' does not exist on type '{ title: string; content: string; tags: never[]; }'.

363         return data.name && data.amount && data.currency && data.recipient && data.frequency
                        ~~~~

app/blinks/page.tsx:363:34 - error TS2339: Property 'amount' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'amount' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

363         return data.name && data.amount && data.currency && data.recipient && data.frequency
                                     ~~~~~~

app/blinks/page.tsx:363:49 - error TS2339: Property 'currency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'currency' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

363         return data.name && data.amount && data.currency && data.recipient && data.frequency
                                                    ~~~~~~~~

app/blinks/page.tsx:363:66 - error TS2339: Property 'recipient' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'recipient' does not exist on type '{ name: string; description: string; image: File | null; attributes: never[]; }'.

363         return data.name && data.amount && data.currency && data.recipient && data.frequency
                                                                     ~~~~~~~~~

app/blinks/page.tsx:363:84 - error TS2339: Property 'frequency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; } | { name: string; amount: string; currency: string; recipient: string; message: string; } | ... 5 more ... | { ...; }'.
  Property 'frequency' does not exist on type '{ name: string; amount: string; currency: string; memo: string; recipient: string; paymentMethod: string; }'.

363         return data.name && data.amount && data.currency && data.recipient && data.frequency
                                                                                       ~~~~~~~~~

app/checkout/page.tsx:10:10 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createTransferCheckedInstruction'.

10 import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/checkout/page.tsx:10:44 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAssociatedTokenAddress'.

10 import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~

app/checkout/page.tsx:10:71 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getMint'.

10 import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
                                                                         ~~~~~~~

app/checkout/page.tsx:10:80 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createAssociatedTokenAccountInstruction'.

10 import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
                                                                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/checkout/page.tsx:77:21 - error TS2552: Cannot find name 'BigNumber'. Did you mean 'Number'?

77         amount: new BigNumber(amount),
                       ~~~~~~~~~

  node_modules/.pnpm/typescript@5.6.3/node_modules/typescript/lib/lib.es5.d.ts:619:13
    619 declare var Number: NumberConstructor;
                    ~~~~~~
    'Number' is declared here.

app/checkout/page.tsx:79:9 - error TS2322: Type 'Uint8Array' is not assignable to type 'References | undefined'.
  Type 'Uint8Array' is missing the following properties from type 'PublicKey[]': pop, push, concat, shift, and 6 more.

79         reference,
           ~~~~~~~~~

  node_modules/.pnpm/@solana+pay@0.2.5_bufferutil@4.0.8_fastestsmallesttextencoderdecoder@1.0.22_typescript@5.6.3_utf-8-validate@5.0.10/node_modules/@solana/pay/lib/types/encodeURL.d.ts:24:5
    24     reference?: References;
           ~~~~~~~~~
    The expected type comes from property 'reference' which is declared here on type 'TransferRequestURLFields'

app/checkout/page.tsx:86:20 - error TS2339: Property 'toDataURL' does not exist on type 'QRCodeStyling'.

86       setQrCode(qr.toDataURL())
                      ~~~~~~~~~

app/checkout/payment-form.tsx:3:81 - error TS2307: Cannot find module './validate-transfer' or its corresponding type declarations.

3 import { validateTransfer, ValidateTransferFields, ValidateTransferError } from './validate-transfer';
                                                                                  ~~~~~~~~~~~~~~~~~~~~~

app/checkout/payment-form.tsx:40:26 - error TS18046: 'err' is of type 'unknown'.

40                 setError(err.message);
                            ~~~

app/generate/page.tsx:7:10 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createMint'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
           ~~~~~~~~~~

app/generate/page.tsx:7:22 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getOrCreateAssociatedTokenAccount'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/generate/page.tsx:7:57 - error TS2305: Module '"@solana/spl-token"' has no exported member 'mintTo'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
                                                          ~~~~~~

app/generate/page.tsx:17:62 - error TS2305: Module '"lucide-react"' has no exported member 'Discord'.

17 import { Zap, Download, Share2, Twitter, Facebook, Linkedin, Discord, Telegram, Instagram, Loader2 } from 'lucide-react'
                                                                ~~~~~~~

app/generate/page.tsx:17:71 - error TS2305: Module '"lucide-react"' has no exported member 'Telegram'.

17 import { Zap, Download, Share2, Twitter, Facebook, Linkedin, Discord, Telegram, Instagram, Loader2 } from 'lucide-react'
                                                                         ~~~~~~~~

app/generate/token/route.ts:2:27 - error TS2307: Cannot find module '@/lib/mongodb' or its corresponding type declarations.

2 import clientPromise from '@/lib/mongodb';
                            ~~~~~~~~~~~~~~~

app/index.ts:3:15 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

3 export * from './solana-pay/create-transfer.ts';
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/index.ts:9:15 - error TS5097: An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.

9 export * from './solana-pay/validate-transfer.ts';
                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/nft/generate/page.tsx:7:10 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createMint'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
           ~~~~~~~~~~

app/nft/generate/page.tsx:7:22 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getOrCreateAssociatedTokenAccount'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/nft/generate/page.tsx:7:57 - error TS2305: Module '"@solana/spl-token"' has no exported member 'mintTo'.

7 import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
                                                          ~~~~~~

app/pages/payments/create-payment-request.ts:3:10 - error TS2305: Module '"@solana/pay"' has no exported member 'PaymentRequest'.

3 import { PaymentRequest, encodePaymentURI } from '@solana/pay';
           ~~~~~~~~~~~~~~

app/pages/payments/create-payment-request.ts:3:26 - error TS2305: Module '"@solana/pay"' has no exported member 'encodePaymentURI'.

3 import { PaymentRequest, encodePaymentURI } from '@solana/pay';
                           ~~~~~~~~~~~~~~~~

app/pages/payments/create-payment-request.ts:7:35 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

7 const connection = new Connection(SOLANA_RPC_URL);
                                    ~~~~~~~~~~~~~~

app/pages/payments/solana-pay.ts:2:10 - error TS2305: Module '"@solana/pay"' has no exported member 'PaymentRequest'.

2 import { PaymentRequest, encodePaymentURI as encodeSolanaPayURI } from '@solana/pay';
           ~~~~~~~~~~~~~~

app/pages/payments/solana-pay.ts:2:26 - error TS2305: Module '"@solana/pay"' has no exported member 'encodePaymentURI'.

2 import { PaymentRequest, encodePaymentURI as encodeSolanaPayURI } from '@solana/pay';
                           ~~~~~~~~~~~~~~~~

app/pages/payments/solana-pay.ts:7:35 - error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
  Type 'undefined' is not assignable to type 'string'.

7 const connection = new Connection(SOLANA_RPC_URL, "confirmed");
                                    ~~~~~~~~~~~~~~

app/pages/swap/page.tsx:6:34 - error TS2305: Module '"@jup-ag/api"' has no exported member 'RouteInfo'.

6 import { createJupiterApiClient, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/api'
                                   ~~~~~~~~~

app/pages/swap/page.tsx:6:45 - error TS2305: Module '"@jup-ag/api"' has no exported member 'TOKEN_LIST_URL'.

6 import { createJupiterApiClient, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/api'
                                              ~~~~~~~~~~~~~~

app/pages/swap/page.tsx:89:9 - error TS2353: Object literal may only specify known properties, and 'route' does not exist in type 'SwapPostRequest'.

89         route: selectedRoute,
           ~~~~~

app/pages/swap/page.tsx:136:9 - error TS2322: Type 'string' is not assignable to type 'number'.

136         amount: (inputAmount * 10 ** 9).toString(), // Convert to lamports
            ~~~~~~

  node_modules/.pnpm/@jup-ag+api@6.0.29/node_modules/@jup-ag/api/dist/index.d.ts:1047:5
    1047     amount: number;
             ~~~~~~
    The expected type comes from property 'amount' which is declared here on type 'QuoteGetRequest'

app/pages/swap/page.tsx:140:24 - error TS2339: Property 'data' does not exist on type 'QuoteResponse'.

140       setRoutes(routes.data)
                           ~~~~

app/pages/swap/page.tsx:141:31 - error TS2339: Property 'data' does not exist on type 'QuoteResponse'.

141       setSelectedRoute(routes.data[0])
                                  ~~~~

app/pages/swap/page.tsx:260:50 - error TS7006: Parameter 'm' implicitly has an 'any' type.

260               <p>{selectedRoute.marketInfos.map((m) => m.label).join(' -> ')}</p>
                                                     ~

app/solana-pay/create-transfer.ts:1:10 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createTransferCheckedInstruction'.

1 import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
           ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/solana-pay/create-transfer.ts:1:44 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAccount'.

1 import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
                                             ~~~~~~~~~~

app/solana-pay/create-transfer.ts:1:56 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAssociatedTokenAddress'.

1 import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
                                                         ~~~~~~~~~~~~~~~~~~~~~~~~~

app/solana-pay/create-transfer.ts:1:83 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getMint'.

1 import { createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
                                                                                    ~~~~~~~

app/solana-pay/encodeURL.ts:1:33 - error TS2307: Cannot find module '../constants.ts' or its corresponding type declarations.

1 import { SOLANA_PROTOCOL } from '../constants.ts';
                                  ~~~~~~~~~~~~~~~~~

app/solana-pay/validate-transfer.ts:2:5 - error TS2305: Module '"@solana/spl-token"' has no exported member 'decodeInstruction'.

2     decodeInstruction,
      ~~~~~~~~~~~~~~~~~

app/solana-pay/validate-transfer.ts:3:5 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAssociatedTokenAddress'.

3     getAssociatedTokenAddress,
      ~~~~~~~~~~~~~~~~~~~~~~~~~

app/solana-pay/validate-transfer.ts:4:5 - error TS2305: Module '"@solana/spl-token"' has no exported member 'isTransferCheckedInstruction'.

4     isTransferCheckedInstruction,
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app/solana-pay/validate-transfer.ts:5:5 - error TS2305: Module '"@solana/spl-token"' has no exported member 'isTransferInstruction'.

5     isTransferInstruction,
      ~~~~~~~~~~~~~~~~~~~~~

app/token/page.tsx:5:30 - error TS2307: Cannot find module '@/components/providers' or its corresponding type declarations.

5 import { WalletButton } from '@/components/providers'
                               ~~~~~~~~~~~~~~~~~~~~~~~~

app/token/page.tsx:6:21 - error TS2307: Cannot find module '@/components/preview' or its corresponding type declarations.

6 import Preview from "@/components/preview"
                      ~~~~~~~~~~~~~~~~~~~~~~

app/token/page.tsx:14:30 - error TS2307: Cannot find module 'react-icons/fa' or its corresponding type declarations.

14 import { FaInfoCircle } from 'react-icons/fa'
                                ~~~~~~~~~~~~~~~~

components/payments/payment-form.tsx:7:38 - error TS2307: Cannot find module '@/app/solana/pay' or its corresponding type declarations.

7 import { createPaymentRequest } from '@/app/solana/pay';
                                       ~~~~~~~~~~~~~~~~~~

components/payments/payment-form.tsx:48:26 - error TS2304: Cannot find name 'encodePaymentURI'.

48       const paymentURI = encodePaymentURI(paymentRequest);
                            ~~~~~~~~~~~~~~~~

components/transactions.tsx:84:66 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

84         transaction = await createMintNFTTransaction(connection, publicKey, formData.mint)
                                                                    ~~~~~~~~~

components/transactions.tsx:86:72 - error TS2345: Argument of type 'PublicKey | null' is not assignable to parameter of type 'PublicKey'.
  Type 'null' is not assignable to type 'PublicKey'.

86         transaction = await createTokenTransferTransaction(connection, publicKey, formData.transfer)
                                                                          ~~~~~~~~~

components/transactions.tsx:89:39 - error TS2722: Cannot invoke an object which is possibly 'undefined'.

89       const signedTransaction = await signTransaction(transaction)
                                         ~~~~~~~~~~~~~~~

components/transactions.tsx:89:39 - error TS18048: 'signTransaction' is possibly 'undefined'.

89       const signedTransaction = await signTransaction(transaction)
                                         ~~~~~~~~~~~~~~~

components/transactions.tsx:147:7 - error TS2345: Argument of type 'PublicKey' is not assignable to parameter of type 'Signer'.
  Type 'PublicKey' is missing the following properties from type 'Signer': publicKey, secretKey

147       fromPubkey
          ~~~~~~~~~~

components/transactions.tsx:318:85 - error TS18047: 'value' is possibly 'null'.

318                     key === 'image' ? (value as File)?.name || 'No file selected' : value.toString()
                                                                                        ~~~~~

components/ui/layout/tokenomics.tsx:188:41 - error TS2322: Type '{ data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number; }' is not assignable to type 'ChartConfig'.
  Property 'data' is incompatible with index signature.
    Type 'number[]' is not assignable to type '{ label?: ReactNode; icon?: ComponentType<{}> | undefined; } & ({ color?: string | undefined; theme?: undefined; } | { color?: undefined; theme: Record<"light" | "dark", string>; })'.

188                         <ChartContainer config={tokenAllocation.datasets[0]} className="w-full max-w-md mx-auto">
                                            ~~~~~~

  components/ui/chart.tsx:45:5
    45     config: ChartConfig
           ~~~~~~
    The expected type comes from property 'config' which is declared here on type 'IntrinsicAttributes & Omit<ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement> & { ...; }, "ref"> & RefAttributes<...>'

components/ui/layout/tokenomics.tsx:290:41 - error TS2322: Type '{ label: string; data: number[]; borderColor: string; backgroundColor: string; tension: number; fill: boolean; }' is not assignable to type 'ChartConfig'.
  Property 'label' is incompatible with index signature.
    Type 'string' is not assignable to type '{ label?: ReactNode; icon?: ComponentType<{}> | undefined; } & ({ color?: string | undefined; theme?: undefined; } | { color?: undefined; theme: Record<"light" | "dark", string>; })'.

290                         <ChartContainer config={emissionSchedule.datasets[0]}>
                                            ~~~~~~

  components/ui/chart.tsx:45:5
    45     config: ChartConfig
           ~~~~~~
    The expected type comes from property 'config' which is declared here on type 'IntrinsicAttributes & Omit<ClassAttributes<HTMLDivElement> & HTMLAttributes<HTMLDivElement> & { ...; }, "ref"> & RefAttributes<...>'

lib/db/queries.ts:103:33 - error TS2339: Property 'users' does not exist on type 'DrizzleTypeError<"Seems like the schema generic is missing - did you forget to add it to your DB type?">'.

103   const result = await db.query.users.findFirst({
                                    ~~~~~

lib/db/seed.ts:2:17 - error TS2305: Module '"./schema"' has no exported member 'transactions'.

2 import { users, transactions, wallets, settings } from './schema'
                  ~~~~~~~~~~~~

lib/db/seed.ts:2:31 - error TS2305: Module '"./schema"' has no exported member 'wallets'.

2 import { users, transactions, wallets, settings } from './schema'
                                ~~~~~~~

lib/db/seed.ts:2:40 - error TS2305: Module '"./schema"' has no exported member 'settings'.

2 import { users, transactions, wallets, settings } from './schema'
                                         ~~~~~~~~

lib/db/seed.ts:11:45 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(value: { email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }): PgInsertBase<...>', gave the following error.
    Argument of type '{ email: string; name: string; }' is not assignable to parameter of type '{ email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }'.
      Property 'passwordHash' is missing in type '{ email: string; name: string; }' but required in type '{ email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }'.
  Overload 2 of 2, '(values: { email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }[]): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'email' does not exist in type '{ email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }[]'.

11       const [user] = await db.insert(users).values({
                                               ~~~~~~


lib/db/seed.ts:24:32 - error TS2339: Property 'solanaAddress' does not exist on type 'FinanceModule'.

24         address: faker.finance.solanaAddress(),
                                  ~~~~~~~~~~~~~

lib/db/sessions.ts:3:10 - error TS2305: Module '"./schema"' has no exported member 'sessions'.

3 import { sessions } from './schema'
           ~~~~~~~~

lib/db/setup.ts:2:17 - error TS2305: Module '"./schema"' has no exported member 'transactions'.

2 import { users, transactions, wallets, settings } from './schema'
                  ~~~~~~~~~~~~

lib/db/setup.ts:2:31 - error TS2305: Module '"./schema"' has no exported member 'wallets'.

2 import { users, transactions, wallets, settings } from './schema'
                                ~~~~~~~

lib/db/setup.ts:2:40 - error TS2305: Module '"./schema"' has no exported member 'settings'.

2 import { users, transactions, wallets, settings } from './schema'
                                         ~~~~~~~~

lib/db/setup.ts:13:45 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(value: { email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'solanaAddress' does not exist in type '{ email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }'.
  Overload 2 of 2, '(values: { email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }[]): PgInsertBase<...>', gave the following error.
    Object literal may only specify known properties, and 'email' does not exist in type '{ email: string | SQL<unknown> | Placeholder<string, any>; passwordHash: string | SQL<unknown> | Placeholder<string, any>; id?: number | SQL<unknown> | Placeholder<...> | undefined; ... 4 more ...; deletedAt?: SQL<...> | ... 3 more ... | undefined; }[]'.

13       const [user] = await db.insert(users).values({
                                               ~~~~~~


lib/db/setup.ts:27:59 - error TS2353: Object literal may only specify known properties, and 'precision' does not exist in type '{ min?: number | undefined; max?: number | undefined; fractionDigits?: number | undefined; multipleOf?: number | undefined; }'.

27         solBalance: faker.number.float({ min: 0, max: 10, precision: 0.000000001 }).toString(),
                                                             ~~~~~~~~~

lib/db/setup.ts:28:62 - error TS2353: Object literal may only specify known properties, and 'precision' does not exist in type '{ min?: number | undefined; max?: number | undefined; fractionDigits?: number | undefined; multipleOf?: number | undefined; }'.

28         usdcBalance: faker.number.float({ min: 0, max: 1000, precision: 0.000001 }).toString(),
                                                                ~~~~~~~~~

lib/db/setup.ts:29:65 - error TS2353: Object literal may only specify known properties, and 'precision' does not exist in type '{ min?: number | undefined; max?: number | undefined; fractionDigits?: number | undefined; multipleOf?: number | undefined; }'.

29         miltonBalance: faker.number.float({ min: 0, max: 10000, precision: 0.000000001 }).toString(),
                                                                   ~~~~~~~~~

lib/db/setup.ts:42:60 - error TS2353: Object literal may only specify known properties, and 'precision' does not exist in type '{ min?: number | undefined; max?: number | undefined; fractionDigits?: number | undefined; multipleOf?: number | undefined; }'.

42           amount: faker.number.float({ min: 0.1, max: 100, precision: 0.000000001 }).toString(),
                                                              ~~~~~~~~~

lib/rate-limit.ts:22:36 - error TS2345: Argument of type '{}' is not assignable to parameter of type 'string'.

22   const count = current ? parseInt(current, 10) : 0
                                      ~~~~~~~

lib/solana/milton-token-utils.ts:5:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAssociatedTokenAddress'.

5   getAssociatedTokenAddress,
    ~~~~~~~~~~~~~~~~~~~~~~~~~

lib/solana/milton-token-utils.ts:6:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createAssociatedTokenAccountInstruction'.

6   createAssociatedTokenAccountInstruction,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/solana/milton-token-utils.ts:7:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getAccount'.

7   getAccount,
    ~~~~~~~~~~

lib/solana/milton-token-utils.ts:8:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'getMint'.

8   getMint,
    ~~~~~~~

lib/solana/milton-token-utils.ts:9:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createTransferCheckedInstruction'.

9   createTransferCheckedInstruction,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/solana/milton-token-utils.ts:10:3 - error TS2305: Module '"@solana/spl-token"' has no exported member 'createBurnCheckedInstruction'.

10   createBurnCheckedInstruction
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:57:18 - error TS2552: Cannot find name 'MILTON_MINT_ADDRESS'. Did you mean 'MILTON_MINT_ADDRESS'?

57     mintAddress: MILTON_MINT_ADDRESS,
                    ~~~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:63:18 - error TS2552: Cannot find name 'USDC_TOKEN_ADDRESS'. Did you mean 'USDC_MINT_ADDRESS'?

63     mintAddress: USDC_TOKEN_ADDRESS,
                    ~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:69:18 - error TS2552: Cannot find name 'USDT_MINT_ADDRESS'. Did you mean 'USDT_MINT_ADDRESS'?

69     mintAddress: USDT_MINT_ADDRESS,
                    ~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:75:18 - error TS2304: Cannot find name 'SOL_MINT_ADDRESS'.

75     mintAddress: SOL_MINT_ADDRESS,
                    ~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:167:3 - error TS2552: Cannot find name 'MILTON_MINT_ADDRESS'. Did you mean 'MILTON_MINT_ADDRESS'?

167   MILTON_MINT_ADDRESS,
      ~~~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:168:3 - error TS2552: Cannot find name 'USDC_TOKEN_ADDRESS'. Did you mean 'USDC_MINT_ADDRESS'?

168   USDC_TOKEN_ADDRESS,
      ~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:169:3 - error TS2552: Cannot find name 'USDT_MINT_ADDRESS'. Did you mean 'USDT_MINT_ADDRESS'?

169   USDT_MINT_ADDRESS,
      ~~~~~~~~~~~~~~~~~~

lib/solana/solana-programs.ts:170:3 - error TS18004: No value exists in scope for the shorthand property 'SOL_MINT_ADDRESS'. Either declare one or provide an initializer.

170   SOL_MINT_ADDRESS,
      ~~~~~~~~~~~~~~~~~

lib/solana/solana-utils.ts:5:3 - error TS2724: '"@solana/spl-token"' has no exported member named 'TOKEN_2022_PROGRAM_ID'. Did you mean 'TOKEN_PROGRAM_ID'?

5   TOKEN_2022_PROGRAM_ID,
    ~~~~~~~~~~~~~~~~~~~~~

  node_modules/@metaplex/js/node_modules/@solana/spl-token/lib/index.d.ts:14:16
    14   export const TOKEN_PROGRAM_ID: PublicKey;
                      ~~~~~~~~~~~~~~~~
    'TOKEN_PROGRAM_ID' is declared here.


Found 194 errors in 39 files.

Errors  Files
     3  app/(dashboard)/page.tsx:7
     3  app/actions.json/route.ts:58
     4  app/api/actions/donate/donate-usdc/route.ts:117
    15  app/api/actions/solana-pay/route.ts:3
     1  app/api/v1/actions/blinks/get-blinks/route.ts:2
     8  app/api/v1/actions/milton/route.ts:3
     6  app/api/v1/actions/milton/transfer/route.ts:3
     2  app/api/v1/actions/referral/route.ts:9
     3  app/api/v1/actions/solana-pay/route.ts:3
     5  app/api/v1/actions/swap/route.ts:1
     3  app/api/v1/actions/tokens/[uniqueid]/route.ts:68
     1  app/api/v1/actions/tokens/generate/route.ts:2
    11  app/api/v1/users/route.ts:1
     1  app/blinkboard/page.tsx:23
    42  app/blinks/page.tsx:127
     7  app/checkout/page.tsx:10
     2  app/checkout/payment-form.tsx:3
     5  app/generate/page.tsx:7
     1  app/generate/token/route.ts:2
     2  app/index.ts:3
     3  app/nft/generate/page.tsx:7
     3  app/pages/payments/create-payment-request.ts:3
     3  app/pages/payments/solana-pay.ts:2
     7  app/pages/swap/page.tsx:6
     4  app/solana-pay/create-transfer.ts:1
     1  app/solana-pay/encodeURL.ts:1
     4  app/solana-pay/validate-transfer.ts:2
     3  app/token/page.tsx:5
     2  components/payments/payment-form.tsx:7
     6  components/transactions.tsx:84
     2  components/ui/layout/tokenomics.tsx:188
     1  lib/db/queries.ts:103
     5  lib/db/seed.ts:2
     1  lib/db/sessions.ts:3
     8  lib/db/setup.ts:2
     1  lib/rate-limit.ts:22
     6  lib/solana/milton-token-utils.ts:5
     8  lib/solana/solana-programs.ts:57
     1  lib/solana/solana-utils.ts:5