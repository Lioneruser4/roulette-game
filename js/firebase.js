// firebase.js
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA6deGWWa8UrgXHNmgtiQVAKtKyow9zu00",  // API Anahtarınızı buraya ekleyin
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Use the default app
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

// Google ile giriş yapma fonksiyonu
export function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("Giriş Başarılı: ", user.displayName);

      // Firestore'a kullanıcıyı kaydediyoruz (bakiye, kupon kodu vs.)
      firestore.collection("users").doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        balance: 100,  // Başlangıç bakiyesi 100$
        lastBonus: Date.now(),  // İlk bonus zamanı
      }, { merge: true });
    })
    .catch((error) => {
      console.error("Giriş Hatası: ", error);
    });
}

// Çıkış yapma fonksiyonu
export function googleSignOut() {
  firebase.auth().signOut().then(() => {
    console.log("Çıkış yapıldı.");
  });
}

// Bonus ekleme fonksiyonu (Her 3 saatte bir 50$ bonus ekler)
export function addBonus(userId) {
  const userRef = firestore.collection("users").doc(userId);

  userRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      const now = Date.now();
      const lastBonus = userData.lastBonus || 0;

      // 3 saatlik süreyi kontrol et
      if (now - lastBonus > 3 * 60 * 60 * 1000) {
        const newBalance = (userData.balance || 0) + 50; // Her 3 saatte 50$ ekleniyor
        userRef.update({
          balance: newBalance,
          lastBonus: now
        });
        alert("Bonus eklendi: 50$");
      }
    }
  });
}

// Kullanıcı oturum açtığında bonus kontrolü
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    addBonus(user.uid);
  }
});
// Kupon kodu ekleme fonksiyonu
export function applyCoupon(userId, couponCode) {
  const validCoupons = ["100umios"]; // Geçerli kupon kodları
  const userRef = firestore.collection("users").doc(userId);

  if (validCoupons.includes(couponCode)) {
    userRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const newBalance = (userData.balance || 0) + 100; // 100$ kupon ekliyoruz
        userRef.update({
          balance: newBalance,
        });
        alert("Kupon başarıyla kullanıldı. Hesabınıza 100$ eklendi.");
      }
    });
  } else {
    alert("Geçersiz kupon kodu.");
  }
}

// Demo kullanıcı fonksiyonu
export function demoPlay() {
  const demoUser = {
    displayName: "Demo Kullanıcı",
    email: "demo@game.com",
    uid: "demo1234",
    balance: 5000, // Demo kullanıcı için başlangıç bakiyesi
  };

  console.log("Demo kullanıcı olarak oyun başladı:", demoUser);
}
