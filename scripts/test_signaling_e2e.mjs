import crypto from 'node:crypto';

const WORKER_URL = 'wss://nas-signaling.ssgginfotech.workers.dev';

// Crockford Base32 alphabet matching worker regex: letters (no I, L, O, U) + digits (2-9, no 0, 1)
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

function generateRoomCode() {
  let code = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
    if (i === 3) code += '-';
  }
  return code;
}

function waitForOpen(ws) {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.OPEN) return resolve();
    ws.addEventListener('open', () => resolve(), { once: true });
    ws.addEventListener('error', (err) => reject(err), { once: true });
  });
}

async function runSignalingTest() {
  const room = generateRoomCode();
  console.log(`[TEST] Generated Crockford Base32 room code: ${room}`);

  const wsUrl = `${WORKER_URL}/ws?room=${room}`;
  console.log(`[TEST] Connecting Client A (initiator) to: ${wsUrl}`);
  const clientA = new WebSocket(wsUrl);

  await waitForOpen(clientA);
  console.log('[Client A] Connected & Ready');

  console.log(`[TEST] Connecting Client B (joiner) to: ${wsUrl}`);
  const clientB = new WebSocket(wsUrl);
  await waitForOpen(clientB);
  console.log('[Client B] Connected & Ready');

  const testPassed = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clientA.close();
      clientB.close();
      reject(new Error('Signaling test timed out after 10s'));
    }, 10000);

    let aReceivedAnswer = false;
    let bReceivedOffer = false;
    let aReceivedIce = false;
    let bReceivedIce = false;
    let aReceivedPing = false;

    clientB.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(`[Client B] Received: ${msg.type}`);

      if (msg.type === 'offer') {
        bReceivedOffer = true;
        console.log('[Client B] Relayed offer verified. Sending answer back to A');
        clientB.send(JSON.stringify({
          type: 'answer',
          payload: { sdp: 'v=0\r\no=ClientB 67890 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' }
        }));

        console.log('[Client B] Sending ICE candidate to A');
        clientB.send(JSON.stringify({
          type: 'ice',
          payload: { candidate: 'candidate:1 1 UDP 2122260223 192.168.1.50 54321 typ host' }
        }));
      }

      if (msg.type === 'ice') {
        bReceivedIce = true;
        console.log('[Client B] Relayed ICE candidate from A verified!');
      }

      checkDone();
    };

    clientA.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      console.log(`[Client A] Received: ${msg.type}`);

      if (msg.type === 'answer') {
        aReceivedAnswer = true;
        console.log('[Client A] Relayed answer verified!');
        console.log('[Client A] Sending ICE candidate to B');
        clientA.send(JSON.stringify({
          type: 'ice',
          payload: { candidate: 'candidate:2 1 UDP 2122260223 192.168.1.100 12345 typ host' }
        }));
      }

      if (msg.type === 'ice') {
        aReceivedIce = true;
        console.log('[Client A] Relayed ICE candidate from B verified!');
      }

      if (msg.type === 'ping') {
        aReceivedPing = true;
        console.log('[Client A] Ping response received from worker!');
      }

      checkDone();
    };

    let done = false;
    function checkDone() {
      if (!done && aReceivedAnswer && bReceivedOffer && aReceivedIce && bReceivedIce && aReceivedPing) {
        done = true;
        clearTimeout(timeout);
        clientA.onerror = null;
        clientB.onerror = null;
        clientA.close();
        clientB.close();
        resolve(true);
      }
    }

    clientA.onerror = (err) => { if (!done) console.error('[Client A] Error:', err); };
    clientB.onerror = (err) => { if (!done) console.error('[Client B] Error:', err); };

    // After brief delay, Client A sends ping and offer
    setTimeout(() => {
      console.log('[Client A] Sending ping to worker');
      clientA.send(JSON.stringify({ type: 'ping' }));

      console.log('[Client A] Sending SDP offer');
      clientA.send(JSON.stringify({
        type: 'offer',
        payload: { sdp: 'v=0\r\no=ClientA 12345 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n' }
      }));
    }, 400);
  });

  if (testPassed) {
    console.log('\n========================================================================');
    console.log('SUCCESS: Full E2E WebRTC Signaling (offer, answer, ice, ping) Passed!');
    console.log('Worker relays all WebRTC signaling JSON accurately between 2 peers.');
    console.log('========================================================================');
  }
}

runSignalingTest().catch((err) => {
  console.error('[FAIL]', err);
  process.exit(1);
});
