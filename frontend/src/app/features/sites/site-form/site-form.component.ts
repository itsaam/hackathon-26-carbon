import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import { Material, SiteService } from '../../../core/services/site.service';

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './site-form.component.html',
  styleUrl: './site-form.component.scss'
})
export class SiteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly siteService = inject(SiteService);

  form = this.fb.group({
    name: [''],
    surfaceM2: [0],
    parkingUnderground: [0],
    parkingBasement: [0],
    parkingOutdoor: [0],
    energyConsumptionMwh: [0],
    employeeCount: [0],
    workstationCount: [0],
    materials: this.fb.array([])
  });

  materialsOptions: Material[] = [];
  saving = false;

  get materialsArray(): FormArray {
    return this.form.get('materials') as FormArray;
  }

  ngOnInit(): void {
    this.siteService.getMaterials().subscribe({
      next: (materials) => {
        this.materialsOptions = materials;
      }
    });

    this.addMaterialRow();
  }

  addMaterialRow(): void {
    this.materialsArray.push(
      this.fb.group({
        materialId: [null],
        quantity: [0]
      })
    );
  }

  removeMaterialRow(index: number): void {
    this.materialsArray.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const payload = {
      name: value.name ?? '',
      surfaceM2: value.surfaceM2 ?? 0,
      parkingUnderground: value.parkingUnderground ?? 0,
      parkingBasement: value.parkingBasement ?? 0,
      parkingOutdoor: value.parkingOutdoor ?? 0,
      energyConsumptionKwh: (value.energyConsumptionMwh ?? 0) * 1000,
      employeeCount: value.employeeCount ?? 0,
      workstationCount: value.workstationCount ?? 0
    };

    this.saving = true;
    this.siteService.createSite(payload).subscribe({
      next: (site) => {
        this.saving = false;
        this.router.navigate(['/sites', site.id]);
      },
      error: () => {
        this.saving = false;
      }
    });
  }
}

