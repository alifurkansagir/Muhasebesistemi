import { 
  type InsertPaymentMethod, type PaymentMethod,
  type InsertPaymentPlan, type PaymentPlan,
  type InsertPayment, type Payment
} from "@shared/schema";

import { MemStorage } from "./base";

export class PaymentMemStorage extends MemStorage {
  // Payment Methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }
  
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }
  
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.nextIds.paymentMethod++;
    const newMethod: PaymentMethod = { ...method, id };
    
    // Ensure all nullable properties are at least null instead of undefined
    if (newMethod.description === undefined) newMethod.description = null;
    if (newMethod.integrationSettings === undefined) newMethod.integrationSettings = null;
    
    this.paymentMethods.set(id, newMethod);
    return newMethod;
  }
  
  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const existingMethod = this.paymentMethods.get(id);
    if (!existingMethod) return undefined;
    
    const updatedMethod = { ...existingMethod, ...method };
    this.paymentMethods.set(id, updatedMethod);
    return updatedMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    return this.paymentMethods.delete(id);
  }
  
  // Payment Plans
  async getPaymentPlans(): Promise<PaymentPlan[]> {
    return Array.from(this.paymentPlans.values());
  }
  
  async getPaymentPlan(id: number): Promise<PaymentPlan | undefined> {
    return this.paymentPlans.get(id);
  }
  
  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> {
    const id = this.nextIds.paymentPlan++;
    const newPlan: PaymentPlan = { ...plan, id };
    
    // Ensure all nullable properties are at least null instead of undefined
    if (newPlan.description === undefined) newPlan.description = null;
    
    this.paymentPlans.set(id, newPlan);
    return newPlan;
  }
  
  async updatePaymentPlan(id: number, plan: Partial<InsertPaymentPlan>): Promise<PaymentPlan | undefined> {
    const existingPlan = this.paymentPlans.get(id);
    if (!existingPlan) return undefined;
    
    const updatedPlan = { ...existingPlan, ...plan };
    this.paymentPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deletePaymentPlan(id: number): Promise<boolean> {
    return this.paymentPlans.delete(id);
  }
  
  // Payments
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
  
  async getInvoicePayments(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.invoiceId === invoiceId
    );
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.nextIds.payment++;
    const newPayment: Payment = { ...payment, id };
    
    // Ensure all nullable properties are at least null instead of undefined
    if (newPayment.notes === undefined) newPayment.notes = null;
    if (newPayment.reference === undefined) newPayment.reference = null;
    if (newPayment.transactionId === undefined) newPayment.transactionId = null;
    if (newPayment.paymentPlanId === undefined) newPayment.paymentPlanId = null;
    if (newPayment.installmentNumber === undefined) newPayment.installmentNumber = null;
    
    this.payments.set(id, newPayment);
    return newPayment;
  }
  
  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> {
    const existingPayment = this.payments.get(id);
    if (!existingPayment) return undefined;
    
    const updatedPayment = { ...existingPayment, ...payment };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  async deletePayment(id: number): Promise<boolean> {
    return this.payments.delete(id);
  }
  
  // Create installment payments for an invoice
  async createInstallmentPayments(invoiceId: number, paymentPlanId: number, initialAmount: number): Promise<Payment[]> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    
    const paymentPlan = this.paymentPlans.get(paymentPlanId);
    if (!paymentPlan) throw new Error("Payment plan not found");
    
    // Default payment method (bank transfer)
    const defaultPaymentMethod = Array.from(this.paymentMethods.values()).find(
      method => method.defaultForInvoices
    ) || Array.from(this.paymentMethods.values())[0];
    
    if (!defaultPaymentMethod) throw new Error("No payment method found");
    
    // Calculate total amount with processing fee
    const totalAmount = initialAmount * (1 + (paymentPlan.processingFeePercentage / 100));
    
    // Calculate installment amount
    const installmentAmount = Math.round((totalAmount / paymentPlan.numberOfInstallments) * 100) / 100;
    
    // Create installment payments
    const payments: Payment[] = [];
    
    for (let i = 0; i < paymentPlan.numberOfInstallments; i++) {
      const dueDate = new Date(invoice.date);
      dueDate.setDate(dueDate.getDate() + (i * paymentPlan.intervalDays));
      
      const payment = await this.createPayment({
        invoiceId,
        amount: i === paymentPlan.numberOfInstallments - 1 
          ? totalAmount - (installmentAmount * (paymentPlan.numberOfInstallments - 1)) // Last payment takes remainder
          : installmentAmount,
        paymentDate: i === 0 ? new Date() : dueDate, // First payment is now, rest are in the future
        paymentMethodId: defaultPaymentMethod.id,
        status: i === 0 ? "completed" : "pending",
        reference: `${invoice.invoiceNumber}-TAKSIT-${i+1}`,
        notes: `Taksit ${i+1}/${paymentPlan.numberOfInstallments}`,
        paymentPlanId,
        installmentNumber: i+1,
        transactionId: null
      });
      
      payments.push(payment);
    }
    
    return payments;
  }
}