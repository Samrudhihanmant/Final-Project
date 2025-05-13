getSalesData() {
  return this.firestore.collection('sales', ref => 
    ref.where('userId', '==', this.auth.userId)
       .orderBy('date', 'desc')
       .limit(30)
  ).valueChanges();
}