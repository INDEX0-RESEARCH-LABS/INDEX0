/*
 * Copyright (c) 2026 INDEX0 AI Inc. All Rights Reserved.
 *
 * PROPRIETARY AND CONFIDENTIAL CODE.
 * NOTICE: All information contained herein is, and remains the property of INDEX0 AI Inc.
 * The intellectual and technical concepts contained herein are proprietary to INDEX0 AI Inc.
 * and may be covered by U.S. and Foreign Patents, patents in process, and are protected by
 * trade secret or copyright law. Dissemination of this information or reproduction of this
 * material is strictly forbidden unless prior written permission is obtained from INDEX0 AI Inc.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
