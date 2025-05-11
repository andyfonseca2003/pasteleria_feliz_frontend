import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-editar-cake-order',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent],
  templateUrl: './editar-cake-orders.component.html',
  styleUrl: './editar-cake-orders.component.css'
})
export class EditarCakeOrderComponent implements OnInit {
  orderForm!: FormGroup;
  isLoading: boolean = true;
  minDeliveryDateTime: string;
  
  // Estados permitidos para transiciones
  finalStates: string[] = ['ENTREGADA', 'CANCELADA'];

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private route: ActivatedRoute,
    private pasteleriaService: OrderService,
    private tokenService: TokenService,
    private router: Router
  ) {
    // Establecer la fecha mínima de entrega (hoy)
    const minDate = new Date();
    this.minDeliveryDateTime = minDate.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
    
    this.createForm();
  }

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.cargarOrden(orderId);
    } else {
      this.isLoading = false;
      this.router.navigate(['/listar-ordenes']);
    }
  }

  private createForm(): void {
    this.orderForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      customerName: ['', [Validators.required]],
      customerPhone: ['', [Validators.required]],
      customerEmail: ['', [Validators.email]],
      orderDate: ['', [Validators.required]],
      deliveryDate: ['', [Validators.required]],
      orderStatus: ['', [Validators.required]],
      totalAmount: [0],
      hasInventoryAlert: [false],
      inventoryAlertDetails: [''],
      createdAt: [''],
      updatedAt: [new Date().toISOString()],
      createdById: [''],
      modifiedById: [this.tokenService.getNombre()],
      orderDetails: this.formBuilder.array([])
    });
  }

  cargarOrden(id: string): void {
    this.isLoading = true;
    
    this.pasteleriaService.getCakeOrder(parseInt(id)).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.error) {
          Swal.fire({
            title: 'Error',
            text: response.respuesta || 'No se pudo cargar la orden',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          this.router.navigate(['/listar-ordenes']);
          return;
        }
        
        const order = response.respuesta;
        this.populateForm(order);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar la orden:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudo cargar la orden',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/listar-ordenes']);
      }
    });
  }

  populateForm(order: any): void {
    // Primero limpiamos el array de detalles
    while (this.orderDetailsArray.length) {
      this.orderDetailsArray.removeAt(0);
    }
    
    // Establecemos los valores principales de la orden
    this.orderForm.patchValue({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 16) : '',
      deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().slice(0, 16) : '',
      orderStatus: order.orderStatus,
      totalAmount: order.totalAmount,
      hasInventoryAlert: order.hasInventoryAlert,
      inventoryAlertDetails: order.inventoryAlertDetails,
      createdAt: order.createdAt,
      createdById: order.createdById
    });
    
    // Añadimos cada detalle de la orden
    if (order.orderDetails && order.orderDetails.length > 0) {
      order.orderDetails.forEach((detail: any) => {
        this.orderDetailsArray.push(
          this.formBuilder.group({
            id: [detail.id],
            recipeId: [detail.recipeId, [Validators.required]],
            recipeName: [detail.recipeName],
            quantity: [detail.quantity, [Validators.required, Validators.min(1)]],
            unitPrice: [detail.unitPrice, [Validators.required, Validators.min(0)]],
            subtotal: [detail.subtotal],
            specialInstructions: [detail.specialInstructions || '']
          })
        );
      });
    }
    
    // Si la orden está en estado final, deshabilitamos el formulario
    if (this.isOrderFinalized()) {
      this.orderForm.disable();
    }
  }

  // Getter para acceder a los controles de detalles de orden como un FormArray
  get orderDetailsArray(): FormArray {
    return this.orderForm.get('orderDetails') as FormArray;
  }

  getOrderDetailsControls() {
    return this.orderDetailsArray.controls as FormGroup[];
  }

  calculateSubtotal(index: number): void {
    const detailControl = this.orderDetailsArray.at(index);
    const quantity = detailControl.get('quantity')?.value || 0;
    const unitPrice = detailControl.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    
    detailControl.get('subtotal')?.setValue(subtotal);
    
    // Actualizar el total general
    this.updateTotalAmount();
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

  updateTotalAmount(): void {
    let total = 0;
    
    for (let i = 0; i < this.orderDetailsArray.length; i++) {
      const detailControl = this.orderDetailsArray.at(i);
      const quantity = detailControl.get('quantity')?.value || 0;
      const unitPrice = detailControl.get('unitPrice')?.value || 0;
      total += quantity * unitPrice;
    }
    
    this.orderForm.get('totalAmount')?.setValue(total);
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
    this.pasteleriaService.checkInventoryForOrder(orderData).subscribe({
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
        
        const inventoryCheck = response.respuesta;
        
        // Actualizar el formulario con la información de inventario
        this.orderForm.get('hasInventoryAlert')?.setValue(inventoryCheck.hasInventoryAlert);
        this.orderForm.get('inventoryAlertDetails')?.setValue(inventoryCheck.alertMessage);
        
        if (inventoryCheck.hasInventoryAlert) {
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

  guardarCambios(): void {
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
    
    // Si hay alertas de inventario, pedir confirmación
    if (this.orderForm.get('hasInventoryAlert')?.value) {
      Swal.fire({
        title: 'Advertencia de Inventario',
        text: 'Hay problemas con el inventario. ¿Estás seguro de guardar los cambios?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.submitChanges();
        }
      });
    } else {
      this.submitChanges();
    }
  }
  
  private submitChanges(): void {
    // Mostrar indicador de carga
    Swal.fire({
      title: 'Guardando cambios',
      text: 'Por favor espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    const orderData = this.prepareOrderData();
    const id = Number(this.tokenService.getIDCuenta());
    
    this.pasteleriaService.updateCakeOrderStatus(id, orderData).subscribe({
      next: (response) => {
        Swal.close();
        
        if (response.error) {
          Swal.fire({
            title: 'Error',
            text: response.respuesta || 'Error al actualizar la orden',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }
        
        Swal.fire({
          title: 'Éxito',
          text: 'La orden ha sido actualizada exitosamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/listar-ordenes']);
        });
      },
      error: (error) => {
        Swal.close();
        console.error('Error al actualizar orden:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'Error al actualizar la orden',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }
  
  private prepareOrderData(): any {
    const formValue = this.orderForm.getRawValue(); // Obtiene valores incluso de campos deshabilitados
    
    // Preparar los detalles de la orden
    const orderDetails = formValue.orderDetails.map((detail: any) => {
      return {
        id: detail.id,
        recipeId: detail.recipeId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        specialInstructions: detail.specialInstructions || ''
      };
    });
    
    return {
      id: formValue.id,
      customerName: formValue.customerName,
      customerPhone: formValue.customerPhone,
      customerEmail: formValue.customerEmail,
      orderDate: formValue.orderDate,
      deliveryDate: formValue.deliveryDate,
      orderStatus: formValue.orderStatus,
      hasInventoryAlert: formValue.hasInventoryAlert,
      inventoryAlertDetails: formValue.inventoryAlertDetails,
      totalAmount: this.calculateTotalAmount(),
      createdAt: formValue.createdAt,
      updatedAt: new Date().toISOString(),
      createdById: formValue.createdById,
      modifiedById: formValue.modifiedById,
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

  showStatusChangeModal(): void {
    // Solo muestra el modal si la orden no está en estado final
    if (this.isOrderFinalized()) {
      Swal.fire({
        title: 'Información',
        text: 'Esta orden ya ha alcanzado su estado final y no puede ser modificada.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    const currentStatus = this.orderForm.get('orderStatus')?.value;
    const nextStates = this.getNextPossibleStates(currentStatus);
    
    if (nextStates.length === 0) {
      Swal.fire({
        title: 'Información',
        text: 'No hay estados disponibles para esta transición.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Crear opciones para el selector
    const inputOptions: Record<string, string> = {};
    nextStates.forEach(state => {
      inputOptions[state] = this.getStatusText(state);
    });

    Swal.fire({
      title: 'Cambiar Estado',
      text: 'Selecciona el nuevo estado para la orden',
      input: 'select',
      inputOptions,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Cambiar',
      confirmButtonColor: '#3085d6',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un estado';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value;
        
        // Confirmar si hay alerta de inventario y se está confirmando la orden
        if (this.orderForm.get('hasInventoryAlert')?.value && newStatus === 'CONFIRMADA') {
          Swal.fire({
            title: 'Advertencia',
            text: 'Esta orden tiene alertas de inventario. ¿Seguro que deseas confirmarla?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
          }).then((confirmResult) => {
            if (confirmResult.isConfirmed) {
              this.updateOrderStatus(newStatus);
            }
          });
        } else {
          this.updateOrderStatus(newStatus);
        }
      }
    });
  }

  updateOrderStatus(newStatus: string): void {
    this.orderForm.get('orderStatus')?.setValue(newStatus);
    this.orderForm.get('updatedAt')?.setValue(new Date().toISOString());
    
    // Verificar si el nuevo estado es final para deshabilitar el formulario
    if (this.finalStates.includes(newStatus)) {
      Swal.fire({
        title: 'Advertencia',
        text: 'Este es un estado final. Una vez guardado, la orden no podrá ser modificada. ¿Deseas continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (!result.isConfirmed) {
          // Revertir el cambio si el usuario cancela
          const currentStatus = this.orderForm.get('orderStatus')?.value;
          if (this.finalStates.includes(currentStatus)) {
            this.orderForm.get('orderStatus')?.setValue(currentStatus);
          }
        }
      });
    }
  }

  getNextPossibleStates(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDIENTE':
        return ['CONFIRMADA', 'CANCELADA'];
      case 'CONFIRMADA':
        return ['EN_PREPARACION', 'CANCELADA'];
      case 'EN_PREPARACION':
        return ['LISTA'];
      case 'LISTA':
        return ['ENTREGADA'];
      case 'ENTREGADA':
      case 'CANCELADA':
        return []; // Estados finales, no hay transición posible
      default:
        return ['PENDIENTE', 'CONFIRMADA', 'EN_PREPARACION', 'LISTA', 'ENTREGADA', 'CANCELADA'];
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'EN_PREPARACION':
        return 'En Preparación';
      case 'LISTA':
        return 'Lista';
      case 'ENTREGADA':
        return 'Entregada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }

  isOrderFinalized(): boolean {
    const currentStatus = this.orderForm.get('orderStatus')?.value;
    return this.finalStates.includes(currentStatus);
  }

  canUpdateOrder(): boolean {
    return !this.isOrderFinalized();
  }

  canVerifyInventory(): boolean {
    const currentStatus = this.orderForm.get('orderStatus')?.value;
    return !this.isOrderFinalized() && ['PENDIENTE', 'CONFIRMADA'].includes(currentStatus);
  }

  regresar(): void {
    this.router.navigate(['/listar-ordenes']);
  }
}