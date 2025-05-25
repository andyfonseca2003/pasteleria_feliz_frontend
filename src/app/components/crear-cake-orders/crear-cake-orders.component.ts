import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { TokenService } from '../../services/token.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-crear-cake-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent, NgSelectModule],
  templateUrl: './crear-cake-orders.component.html',
  styleUrl: './crear-cake-orders.component.css'
})
export class CrearCakeOrderComponent implements OnInit {
  orderForm!: FormGroup;
  recetas: any[] = [];
  minDeliveryDateTime: string;
  inventoryCheck: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private orderService: OrderService,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Establecer la fecha mínima de entrega (hoy + 12 horas)
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 12);
    this.minDeliveryDateTime = minDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
    
    this.createForm();
  }

  ngOnInit(): void {
    //this.loadRecetas();
  }

  private createForm(): void {
    this.orderForm = this.formBuilder.group({
      customerName: ['', [Validators.required]],
      customerPhone: ['', [Validators.required]],
      customerEmail: ['', [Validators.email]],
      deliveryDate: ['', [Validators.required]],
      orderStatus: ['PENDIENTE', [Validators.required]],
      createdById: [this.tokenService.getNombre, [Validators.required]],
      orderDetails: this.formBuilder.array([])
    });
    
    // Agregar al menos un detalle de orden al inicio
    this.addOrderDetail();
  }

  // Getter para acceder a los controles de detalles de orden como un FormArray
  get orderDetailsArray(): FormArray {
    return this.orderForm.get('orderDetails') as FormArray;
  }

  getOrderDetailsControls() {
    return this.orderDetailsArray.controls as FormGroup[];
  }

  addOrderDetail(): void {
    const detailGroup = this.formBuilder.group({
      recipeId: [null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      specialInstructions: ['']
    });
    
    this.orderDetailsArray.push(detailGroup);
  }

  removeOrderDetail(index: number): void {
    this.orderDetailsArray.removeAt(index);
  }

  onRecipeChange(event: any, index: number): void {
    if (!event) return;
    
    const recipeId = event.id;
    const detailControl = this.orderDetailsArray.at(index);
    
    // Buscar la receta seleccionada
    const selectedRecipe = this.recetas.find(recipe => recipe.id === recipeId);
    
    if (selectedRecipe) {
      // Establecer el precio sugerido (podría venir de la receta o ser un cálculo)
      detailControl.get('unitPrice')?.setValue(selectedRecipe.suggestedPrice || 0);
      this.calculateSubtotal(index);
    }
  }

  calculateSubtotal(index: number): void {
    const detailControl = this.orderDetailsArray.at(index);
    const quantity = detailControl.get('quantity')?.value || 0;
    const unitPrice = detailControl.get('unitPrice')?.value || 0;
    
    // No necesitamos almacenar el subtotal directamente en el form,
    // pero podemos calcularlo cuando sea necesario
    this.calculateTotalAmount();
  }

  calculateSubtotalDisplay(index: number): string {
    const detailControl = this.orderDetailsArray.at(index);
    const quantity = detailControl.get('quantity')?.value || 0;
    const unitPrice = detailControl.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    
    return subtotal.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  }

  calculateTotalAmount(): number {
    let total = 0;
    
    for (let i = 0; i < this.orderDetailsArray.length; i++) {
      const detailControl = this.orderDetailsArray.at(i);
      const quantity = detailControl.get('quantity')?.value || 0;
      const unitPrice = detailControl.get('unitPrice')?.value || 0;
      total += quantity * unitPrice;
    }
    
    return total;
  }

  verificarInventario(): void {
    if (this.orderForm.invalid) {
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos obligatorios antes de verificar el inventario.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Verificando inventario',
      text: 'Por favor espera mientras verificamos la disponibilidad...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Preparar datos para la verificación
    const orderData = this.prepareOrderData();
    
    // Llamar al servicio para verificar inventario
    this.orderService.checkInventoryForOrder(orderData).subscribe({
      next: (response) => {
        Swal.close();
        
        if (response.error) {
          Swal.fire({
            title: 'Error',
            text: response.respuesta || 'No se pudo verificar el inventario',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
        
        this.inventoryCheck = response.respuesta;
        
        if (this.inventoryCheck.hasInventoryAlert) {
          Swal.fire({
            title: 'Alerta de Inventario',
            text: 'Se han detectado problemas con el inventario. Revisa los detalles en el formulario.',
            icon: 'warning',
            confirmButtonText: 'Revisar'
          });
        } else {
          Swal.fire({
            title: 'Inventario Verificado',
            text: 'Hay suficiente inventario para procesar esta orden.',
            icon: 'success',
            confirmButtonText: 'Continuar'
          });
        }
      },
      error: (error) => {
        Swal.close();
        console.error('Error al verificar inventario:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudo verificar el inventario',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  crearOrden(): void {
    if (this.orderForm.invalid) {
      // Marcar todos los controles como tocados para mostrar los errores
      this.markFormGroupTouched(this.orderForm);
      
      Swal.fire({
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Verificar primero el inventario si no se ha hecho antes
    if (!this.inventoryCheck) {
      this.verificarInventario();
      return;
    }
    
    // Si hay alertas de inventario y el estado es CONFIRMADA, pedir confirmación
    if (this.inventoryCheck.hasInventoryAlert && 
        this.orderForm.get('orderStatus')?.value === 'CONFIRMADA') {
      Swal.fire({
        title: 'Advertencia de Inventario',
        text: 'Hay problemas con el inventario. ¿Estás seguro de confirmar esta orden?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, proceder',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitOrder();
        }
      });
    } else {
      this.submitOrder();
    }
  }
  
  private submitOrder(): void {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Guardando orden',
      text: 'Por favor espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const orderData = this.prepareOrderData();
    
    this.orderService.createCakeOrder(orderData).subscribe({
      next: (response) => {
        Swal.close();
        
        if (response.error) {
          Swal.fire({
            title: 'Error',
            text: response.respuesta || 'Error al crear la orden',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
        
        Swal.fire({
          title: 'Éxito',
          text: 'La orden ha sido creada exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/listar-ordenes']);
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error al crear orden:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'Error al crear la orden',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
  
  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    
    // Preparar los detalles de la orden
    const orderDetails = formValue.orderDetails.map((detail: any) => {
      const quantity = detail.quantity || 0;
      const unitPrice = detail.unitPrice || 0;
      
      return {
        recipeId: detail.recipeId,
        quantity: quantity,
        unitPrice: unitPrice,
        specialInstructions: detail.specialInstructions || ''
      };
    });
    
    return {
      customerName: formValue.customerName,
      customerPhone: formValue.customerPhone,
      customerEmail: formValue.customerEmail,
      deliveryDate: formValue.deliveryDate,
      orderStatus: formValue.orderStatus,
      createdById: formValue.createdById,
      orderDetails: orderDetails
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        (control as FormArray).controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl as FormGroup);
          }
        });
      }
    });
  }

  regresar(): void {
    this.router.navigate(['/listar-ordenes']);
  }
}